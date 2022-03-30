import React, { useRef, useState } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { useHistory } from 'react-router-dom'
import { getAuth, sendEmailVerification, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export default function Signup() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const displayNameRef = useRef();
    const { signup } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const auth = getAuth();
    const storage = getStorage();
    const provider = new GoogleAuthProvider();

    async function handleSubmit(e) {
        e.preventDefault();
        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError('Passwords do not match');
        }
        if (passwordRef.current.value.length < 6) {
            return setError('Password must be at least 6 characters');
        }
        if (displayNameRef.current.value.length < 3) {
            return setError('Display name must be at least 3 characters');
        }
        try {
            setError('')
            setLoading(true)
            await signup(emailRef.current.value, passwordRef.current.value)
            await updateProfile(auth.currentUser, { displayName: displayNameRef.current.value })
            getDownloadURL(ref(storage, 'defaultPFP.png')).then(url => {
            updateProfile(auth.currentUser, { photoURL: url }) })
            await sendEmailVerification(auth.currentUser)
            history.push('/')
        } catch {
            setError('Failed to create account');
            setLoading(false)
        }

        setLoading(false)
    }
    async function handleGoogleSignIn(e) {
        e.preventDefault();
        try {
            setError('')
            setLoading(true)
            signInWithPopup(auth, provider).then((result) => {
                const user = result.user;
                getDownloadURL(ref(storage, 'defaultPFP.png')).then(url => {
                updateProfile(user, { photoURL: url }) })
                sendEmailVerification(user)
                history.push('/')
            });
        } catch {
            setError('Failed to sign in');
            setLoading(false)
        }

        setLoading(false)
    }

  return (
    <>
        <Card>
            <Card.Body>
                <h2 classname="text-center mb-4">Sign Up</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group id="username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="username" ref={displayNameRef} required />
                    </Form.Group>
                    <Form.Group id="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" ref={emailRef} required />
                    </Form.Group>
                    <Form.Group id="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" ref={passwordRef} required />
                    </Form.Group>
                    <Form.Group id="password-confirm">
                        <Form.Label>Password Conformation</Form.Label>
                        <Form.Control type="password" ref={passwordConfirmRef} required />
                    </Form.Group>
                    <br />
                    <Button disabled={loading} type="submit">
                        Sign Up
                    </Button>
                    <br /><br />
                    <Button disabled={loading} onClick={handleGoogleSignIn}>
                        Sign Up with Google
                    </Button>
                </Form>
            </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
            Already have an account? <a href="/login/">Login</a>
        </div>
    </>
  )
}
