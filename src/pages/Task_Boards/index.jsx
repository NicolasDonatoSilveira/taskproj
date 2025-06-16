import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightStartOnRectangleIcon,
  ListBulletIcon, FolderOpenIcon,
  CheckBadgeIcon, Cog6ToothIcon,
  ChevronRightIcon, EllipsisHorizontalIcon,
  TrashIcon, PlusIcon, ArrowPathIcon,
  UserIcon, UsersIcon, ClipboardDocumentListIcon
} from '@heroicons/react/16/solid';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import CreateModal from '../../components/createModal';

/**
 * Main Task Boards page.
 * Handles teams, tasks, collaborators, and modals for CRUD operations.
 */
function Task_Boards() {
  // -------------------- State Management --------------------
  const [filter, setFilter] = useState('allTasks');
  const [content, setContent] = useState([]);
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamsWithTasks, setTeamsWithTasks] = useState([]);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  // Modal visibility states
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({
    name_user: '',
    user_email: '',
    user_password: '',
    role_user: 'Collaborator',
    permission_user: 'None',
  });
  const [newTeam, setNewTeam] = useState({ name_team: '' });
  const today = new Date().toISOString().slice(0, 10);
  const [newTask, setNewTask] = useState({
    name_task: '',
    description_task: '',
    status_task: 'Ongoing',
    start_task: today,
    deadline_task: ''
  });

  // Assign states
  const [assignUserId, setAssignUserId] = useState('');
  const [assignTaskId, setAssignTaskId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [allTasks, setAllTasks] = useState([]);

  // Menu options for team/task actions
  const menuOptions = [
    { label: 'Assign Collaborator', permissions: ['Admin'], icon: <PlusIcon className="w-4 h-4 mr-2" /> },
    { label: 'Assign Task', permissions: ['Admin'], icon: <PlusIcon className="w-4 h-4 mr-2" /> },
    { label: 'Assign Task to Collaborator', permissions: ['Admin', 'Manager'], icon: <PlusIcon className="w-4 h-4 mr-2" /> },
    { label: 'Update Collaborator', permissions: ['Admin', 'Manager'], icon: <ArrowPathIcon className="w-4 h-4 mr-2" /> },
    { label: 'Update Team', permissions: ['Admin', 'Manager'], icon: <ArrowPathIcon className="w-4 h-4 mr-2" /> },
    { label: 'Update Task', permissions: ['Admin', 'Manager'], icon: <ArrowPathIcon className="w-4 h-4 mr-2" /> },
    { label: 'Delete Team', permissions: ['Admin'], icon: <TrashIcon className="w-4 h-4 mr-2" /> },
    { label: 'Delete Task', permissions: ['Admin'], icon: <TrashIcon className="w-4 h-4 mr-2" /> }
  ];

  const navigate = useNavigate();

  // -------------------- Effects --------------------

  // Load teams and collaborators on mount
  useEffect(() => {
    fetchTeamsAndTasks();
    loadCollaborators();
  }, []);

  // Load all tasks on mount
  useEffect(() => {
    fetchAllTasks();
  }, []);

  // Update content when filter, teams or users change
  useEffect(() => {
    handleFilter(filter, teamsWithTasks, allUsers);
  }, [filter, teamsWithTasks, allUsers]);

  // Load user from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-container')) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // -------------------- Data Fetching --------------------

  /**
   * Fetches all teams and their tasks.
   */
  const fetchTeamsAndTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data: teams } = await api.get("/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Fetch tasks for each team
      const teamsWithTasks = await Promise.all(
        teams.map(async (team) => {
          try {
            const { data: tasks } = await api.get(`/team/${team.id_team}/tasks`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return {
              id: team.id_team,
              name: team.name_team,
              tasks: tasks,
            };
          } catch (error) {
            // If no tasks, return empty array
            if (error.response && error.response.status === 404) {
              return {
                id: team.id_team,
                name: team.name_team,
                tasks: [],
              };
            }
            throw error;
          }
        })
      );
      setTeamsWithTasks(teamsWithTasks);
      handleFilter(filter, teamsWithTasks, allUsers);
    } catch (error) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches all collaborators and their teams.
   */
  const loadCollaborators = async () => {
    const token = localStorage.getItem('token');
    try {
      const { data: allUsersData } = await api.get('/users', { headers: { Authorization: `Bearer ${token}` }, });
      // Attach team name to each user
      const usersWithTeams = await Promise.all(
        allUsersData.map(async (u) => {
          if (u.id_team_user) {
            try {
              const { data: team } = await api.get(`/team/${u.id_team_user}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              return { ...u, teamName: team.name_team };
            } catch (err) {
              console.error(`Error fetching user's team ${u.name_user}`, err);
              return { ...u, teamName: 'Unknown Team' };
            }
          } else {
            return { ...u, teamName: 'No team' };
          }
        })
      );
      setAllUsers(usersWithTeams);
      handleFilter(filter, teamsWithTasks, usersWithTeams);
    } catch (error) {
      console.error('Error loading users: ', error);
    }
  };

  /**
   * Fetches all tasks.
   */
  const fetchAllTasks = async () => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await api.get('/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllTasks(data);
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  };

  // -------------------- Filtering Logic --------------------

  /**
   * Filters content based on the selected filter type.
   */
  const handleFilter = (type, teams = teamsWithTasks, users = allUsers) => {
    setFilter(type);
    if (type === 'allTasks') {
      setContent(teams);
    } else if (type === 'myTeam') {
      const userTeamId = user?.id_team_user;
      const myTeamTasks = teams.filter(t => t.id === userTeamId);
      setContent(myTeamTasks);
    } else if (type === 'myTasks') {
      const myId = user?.id_user;
      const myTeamId = user?.id_team_user;
      const token = localStorage.getItem('token');

      if (!myTeamId) {
        setContent([]);
        return;
      }

      // Fetch only the user's tasks
      api.get(`/user/${myId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(({ data: tasks }) => {
          const team = teams.find(t => t.id === myTeamId);
          const teamName = team ? team.name : `Team ${myTeamId}`;
          setContent([
            {
              id: myTeamId,
              name: teamName,
              tasks: tasks
            }
          ]);
        })
        .catch(() => {
          const team = teams.find(t => t.id === myTeamId);
          const teamName = team ? team.name : `Team ${myTeamId}`;
          setContent([
            {
              id: myTeamId,
              name: teamName,
              tasks: []
            }
          ]);
        });
    } else if (type === 'collaborators') {
      if (!user) return;
      // Group users by team
      const groupedByTeamId = {};
      users.forEach(u => {
        const teamId = u.id_team_user || 'no_team';
        if (!groupedByTeamId[teamId]) {
          groupedByTeamId[teamId] = {
            id: u.id_team_user || null,
            name: u.teamName || 'No team',
            tasks: []
          };
        }
        groupedByTeamId[teamId].tasks.push({
          id_task: u.id_user,
          name_task: u.name_user,
          description_task: u.user_email,
          deadline_task: u.created_at_user?.split('T')[0],
          status_task: u.role_user,
        });
      });
      setContent(Object.values(groupedByTeamId));
    }
  };

  // -------------------- CRUD Handlers --------------------

  /**
   * Handles user creation.
   */
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/user', {
        name: newUser.name_user,
        email: newUser.user_email,
        password: newUser.user_password,
        role: newUser.role_user,
        permission: newUser.permission_user
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowCreateUserModal(false);
      setNewUser({ name_user: '', user_email: '', user_password: '', role_user: 'Collaborator', permission_user: 'None' });
      await loadCollaborators();
    } catch (err) {
      console.error('Error creating user: ', err);
      alert('Error creating user. Check the fields and try again.');
    }
  };

  /**
   * Handles team creation.
   */
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/team', {
        name: newTeam.name_team,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowCreateTeamModal(false);
      setNewTeam({ name_team: '' });
      await fetchTeamsAndTasks();
    } catch (err) {
      console.error('Error creating team: ', err);
      alert('Error creating team. Check the fields and try again.');
    }
  };

  /**
   * Handles task creation.
   */
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/task', {
        name: newTask.name_task,
        description: newTask.description_task,
        status: newTask.status_task,
        start: newTask.start_task,
        deadline: newTask.deadline_task,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowCreateTaskModal(false);
      setNewTask({ name_task: '', description_task: '', status_task: 'Ongoing', start_task: today, deadline_task: '', });
      await fetchTeamsAndTasks();
    } catch (err) {
      console.error('Error creating task: ', err);
      alert('Error creating task. Check the fields and try again.');
    }
  };

  /**
   * Handles assigning a user to a team.
   */
  const handleAssignUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.put(`/team/${selectedTeamId}/user/${assignUserId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAssignUserModal(false);
      setAssignUserId('');
      setSelectedTeamId(null);
      await fetchTeamsAndTasks();
      await loadCollaborators();
    } catch (err) {
      alert('Error assigning user to team.');
    }
  };

  /**
   * Handles logout.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // -------------------- Render --------------------
  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 font-inter-regular">
      {/* Sidebar */}
      <aside className="w-70 p-6 md:block border-r border-slate-200">
        <div className="border-b border-slate-200 mb-6 pl-4 flex flex-row justify-between items-start">
          <div>
            <h2 className="text-lg font-inter-bold pb-1 text-slate-700">
              Hello, <span className="text-blue-500">{user?.name_user || "User"}</span>
            </h2>
            <div className="text-sm pb-6 text-slate-400 font-inter-bold">
              {user?.role_user || "Collaborator"}
            </div>
          </div>
          <button onClick={handleLogout} className='ml-2'>
            <ArrowRightStartOnRectangleIcon className="w-5 h-5 mt-1 hover:text-blue-500 text-slate-800 cursor-pointer" />
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex flex-col gap-4 font-inter-medium">
          <button className="cursor-pointer text-left bg-blue-500 font-inter-bold text-white rounded p-4 shadow-lg shadow-blue-500/50 flex items-start gap-2">
            <ListBulletIcon className="w-4 h-4 mt-1" />
            Dashboard
            <ChevronRightIcon className="w-6.5 h-6.5 ml-14" />
          </button>
          <button className="cursor-pointer text-left hover:text-blue-500 px-4 flex items-start gap-2 text-slate-500">
            <FolderOpenIcon className="w-4 h-4 mt-1" />
            Files
          </button>
          <button className="cursor-pointer text-left hover:text-blue-500 px-4 flex items-start gap-2 text-slate-500">
            <CheckBadgeIcon className="w-4 h-4 mt-1" />
            Completed
          </button>
          <button className="cursor-pointer text-left hover:text-blue-500 px-4 flex items-start gap-2 text-slate-500">
            <Cog6ToothIcon className="w-4 h-4 mt-1" />
            Settings
          </button>
          <div className='border-b border-slate-200 my-4'></div>
          {/* Admin-only actions */}
          {user?.permission_user === 'Admin' && (
            <button onClick={() => setShowCreateUserModal(true)} className="cursor-pointer text-left hover:text-blue-500 px-4 flex items-start gap-2 text-slate-500">
              <UserIcon className="w-4 h-4 mt-1" />
              Create Collaborator
            </button>
          )}
          {user?.permission_user === 'Admin' && (
            <button onClick={() => setShowCreateTeamModal(true)} className="cursor-pointer text-left hover:text-blue-500 px-4 flex items-start gap-2 text-slate-500">
              <UsersIcon className="w-4 h-4 mt-1" />
              Create Team
            </button>
          )}
          {user?.permission_user === 'Admin' && (
            <button onClick={() => setShowCreateTaskModal(true)} className="cursor-pointer text-left hover:text-blue-500 px-4 flex items-start gap-2 text-slate-500">
              <ClipboardDocumentListIcon className="w-4 h-4 mt-1" />
              Create Task
            </button>
          )}
        </nav>
      </aside>

      {/* Modals for CRUD actions */}
      {showCreateUserModal && (
        <CreateModal
          title="Create Collaborator"
          fields={[
            { name: "name_user", type: "text", placeholder: "Name", required: true },
            { name: "user_email", type: "email", placeholder: "Email", required: true },
            { name: "user_password", type: "password", placeholder: "Password", required: true },
            { name: "role_user", type: "text", placeholder: "Role", required: false },
            {
              name: "permission_user",
              type: "select",
              placeholder: "Permission",
              required: false,
              options: [
                { value: "None", label: "None" },
                { value: "Manager", label: "Manager" },
                { value: "Admin", label: "Admin" }
              ]
            }
          ]}
          values={newUser}
          setValues={setNewUser}
          onSubmit={handleCreateUser}
          onClose={() => setShowCreateUserModal(false)}
          submitLabel="Create"
        />
      )}

      {showCreateTeamModal && (
        <CreateModal
          title="Create Team"
          fields={[
            { name: "name_team", type: "text", placeholder: "Team Name", required: true },
          ]}
          values={newTeam}
          setValues={setNewTeam}
          onSubmit={handleCreateTeam}
          onClose={() => setShowCreateTeamModal(false)}
          submitLabel="Create"
        />
      )}

      {showCreateTaskModal && (
        <CreateModal
          title="Create Task"
          fields={[
            { name: "name_task", type: "text", placeholder: "Name Task", required: true },
            { name: "description_task", type: "text", placeholder: "Description Task", required: true },
            { name: "start_task", type: "date", placeholder: "Start", required: true },
            { name: "deadline_task", type: "date", placeholder: "Deadline", required: true },
            {
              name: "status_task",
              type: "select",
              placeholder: "Status",
              required: true,
              options: [
                { value: "Ongoing", label: "Ongoing" },
                { value: "Late", label: "Late" },
                { value: "Programmed", label: "Programmed" },
                { value: "Delivered", label: "Delivered" },
                { value: "Cancelled", label: "Cancelled" }
              ]
            }
          ]}
          values={newTask}
          setValues={setNewTask}
          onSubmit={handleCreateTask}
          onClose={() => setShowCreateTaskModal(false)}
          submitLabel="Create"
        />
      )}

      {showAssignUserModal && (
        <CreateModal
          title="Assign Collaborator"
          fields={[
            {
              name: "user_id",
              type: "select",
              placeholder: "Select Collaborator",
              required: true,
              options: allUsers
                .filter(u => !u.id_team_user)
                .map(u => ({ value: u.id_user, label: u.name_user }))
            }
          ]}
          values={{ user_id: assignUserId }}
          setValues={v => setAssignUserId(v.user_id)}
          onSubmit={handleAssignUser}
          onClose={() => {
            setShowAssignUserModal(false);
            setAssignUserId('');
            setSelectedTeamId(null);
          }}
          submitLabel="Assign"
        />
      )}

      {showAssignTaskModal && (
        <CreateModal
          title="Assign Task to Team"
          fields={[
            {
              name: "task_id",
              type: "select",
              placeholder: "Select Task",
              required: true,
              options: allTasks
                .filter(t => !t.id_team_task)
                .map(t => ({ value: t.id_task, label: t.name_task }))
            }
          ]}
          values={{ task_id: assignTaskId }}
          setValues={v => setAssignTaskId(v.task_id)}
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const token = localStorage.getItem('token');
              await api.put(`/team/${selectedTeamId}/task/${assignTaskId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setShowAssignTaskModal(false);
              setAssignTaskId('');
              setSelectedTeamId(null);

              try {
                await fetchTeamsAndTasks();
                await fetchAllTasks();
              } catch (error) {
                console.error('Error updating lists after assign:', error);
              }
            } catch (err) {
              alert('Error assigning task to team.');
            }
          }}
          onClose={() => {
            setShowAssignTaskModal(false);
            setAssignTaskId('');
            setSelectedTeamId(null);
          }}
          submitLabel="Assign"
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Header with filter buttons */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <div className="font-inter-bold text-lg text-slate-700">Task Manager</div>
          <div className="flex gap-4 font-inter-bold text-slate-400 text-sm">
            {['allTasks', 'myTeam', 'myTasks', 'collaborators'].map((type) => (
              <button
                key={type}
                onClick={() => handleFilter(type)}
                className={`transition-all duration-150 active:scale-95 tab-btn ${filter === type ?
                  'bg-blue-500 text-white rounded shadow-lg shadow-blue-500/50 px-3 cursor-pointer' :
                  'hover:text-blue-500 py-3 cursor-pointer'}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </header>

        {/* Board columns */}
        <main className="flex-1 px-6 pt-6 pb-2 relative h-full">
          <div className="flex overflow-x-auto pb-4 h-full">
            {loading ? (
              <div className="w-full flex justify-center items-center h-full animate-pulse text-slate-400">
                Loading...
              </div>
            ) : content.length === 0 ? (
              <div className="text-center text-slate-500">
                No content available for this filter.
              </div>
            ) : (
              <AnimatePresence>
                {content.map((team, idx) => (
                  <motion.div
                    key={team.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-[320px] flex-shrink-0 p-6 flex flex-col h-full"
                  >
                    {/* Team header and menu */}
                    <div className='flex items-center justify-between'>
                      <h3 className="pl-1 text-lg font-inter-bold mb-6 text-slate-700">{team.name}</h3>
                      {(user?.permission_user === 'Admin' || user?.permission_user === 'Manager') && (
                        <div className="relative menu-container">
                          <button
                            onClick={() => setOpenMenuIndex(openMenuIndex === idx ? null : idx)}
                            className="cursor-pointer text-slate-700 p-1 hover:text-blue-500 mb-6"
                          >
                            <EllipsisHorizontalIcon className="w-5 h-5" />
                          </button>
                          {openMenuIndex === idx && (
                            <div className="absolute right-3 mt-2 w-63 bg-slate-50 shadow-lg rounded z-10 border border-slate-200">
                              <ul className="text-sm text-slate-400 font-inter-medium divide-y divide-slate-200">
                                {menuOptions
                                  .filter(option => option.permissions.includes(user?.permission_user))
                                  .map(option => (
                                    <li
                                      key={option.label}
                                      className="pr-4 py-2 mx-2 flex flex-row items-center hover:text-blue-500 cursor-pointer"
                                      onClick={() => {
                                        if (option.label === 'Assign Collaborator') {
                                          setSelectedTeamId(team.id);
                                          setShowAssignUserModal(true);
                                        } else if (option.label === 'Assign Task') {
                                          setSelectedTeamId(team.id);
                                          setShowAssignTaskModal(true);
                                        }
                                        setOpenMenuIndex(null);
                                      }}
                                    >
                                      {option.icon}
                                      {option.label}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Task cards */}
                    <div className="space-y-3 overflow-y-auto flex-1 pr-1 mb-12">
                      {team.tasks.length === 0 ? (
                        <div className="text-center text-slate-400 py-4">
                          There is no task here yet.
                        </div>
                      ) : (
                        team.tasks.map((task, i) => (
                          <motion.div
                            key={task.id_task}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0, duration: 0.2 }}
                            className="border-slate-200 p-4 rounded bg-slate-50 border shadow shadow-slate-200/50"
                          >
                            <div className="flex justify-between items-center py-1">
                              <h4 className="font-inter-bold text-slate-700">{task.name_task}</h4>
                              <span className="text-xs text-slate-300 font-inter-bold">#{task.id_task}</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1 py-1">{task.description_task}</p>
                            <div className="flex justify-between items-center mt-2 text-xs text-slate-500 py-1">
                              <span className={`px-2.5 py-1 font-inter-bold rounded-full text-white text-[9px] shadow-sm ${
                                ['Programmed', 'Collaborator'].includes(task.status_task) ? 'bg-blue-500 shadow-blue-500/50' :
                                ['Delivered', 'Manager'].includes(task.status_task)       ? 'bg-green-500 shadow-green-500/50' :
                                ['Late', 'Admin', 'CEO'].includes(task.status_task)       ? 'bg-red-500 shadow-red-500/50' :
                                task.status_task === 'Ongoing'                            ? 'bg-yellow-500 shadow-yellow-500/50' :
                                task.status_task === 'Done'                               ? 'bg-cyan-500 shadow-cyan-500/50' :
                                                                                            'bg-slate-400 shadow-slate-500/50'}`}>{task.status_task}</span>
                              <span>
                                {task.deadline_task
                                  ? new Date(task.deadline_task).toLocaleDateString('pt-BR') //'pt-BR': dd/mm/yyyy or 'en-US': mm/dd/yyyy
                                  : ''}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Task_Boards;