import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import CreateModal from '../../components/createModal';

/**
 * Login page using the reusable modal.
 * Handles login, saves token/user to localStorage, and redirects.
 */
function Login({ onLogin }) {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loginValues, setLoginValues] = useState({ user_email: '', user_password: '' });
    const errorRef = useRef(null);

    // Login form fields
    const loginFields = [
        { name: "user_email", type: "email", placeholder: "Email", required: true },
        { name: "user_password", type: "password", placeholder: "Password", required: true }
    ];

    // Handles login form submission
    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        try {
            const response = await api.post('/login', {
                email: loginValues.user_email,
                password: loginValues.user_password,
            });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }
            navigate('/task_boards');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Invalid email or password');
            } else {
                setError('Server connection error');
            }
        }
    }

    // Focuses the error message when it appears (accessibility)
    useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.focus();
        }
    }, [error]);

    return (
        <div className="flex h-screen bg-slate-100 items-center justify-center" aria-label="Login page">
            {/* Login modal */}
            <CreateModal
                title="Task Manager Login"
                fields={loginFields}
                values={loginValues}
                setValues={setLoginValues}
                onSubmit={handleSubmit}
                onClose={() => { }}
                submitLabel="Login"
                hideCancel
                backdropClass="bg-slate-100"
            />
            {/* Accessible error message */}
            {error && (
                <div
                    ref={errorRef}
                    tabIndex={-1}
                    aria-live="assertive"
                    className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded shadow outline-none"
                >
                    {error}
                </div>
            )}
        </div>
    );
}

export default Login;