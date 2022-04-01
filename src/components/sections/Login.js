import React, { useRef, useState } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { useHistory } from 'react-router-dom'
import { getAuth, sendEmailVerification, updateProfile, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "firebase/auth"
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const auth = getAuth();
    const storage = getStorage();
    const googleProvider = new GoogleAuthProvider();
    const githubProvider = new GithubAuthProvider();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('')
            setLoading(true)
            await login(emailRef.current.value, passwordRef.current.value)
            history.push('/')
        } catch {
            setError('Email or Password is incorrect!');
            setLoading(false)
        }

        setLoading(false)
    }
    async function handleGoogleSignIn(e) {
        e.preventDefault();
        try {
            setError('')
            setLoading(true)
            await signInWithPopup(auth, googleProvider).then((result) => {
                const user = result.user;
                getDownloadURL(ref(storage, 'defaultPFP.png')).then(url => {
                    updateProfile(user, { photoURL: url })
                })
                sendEmailVerification(user)
                history.push('/')
            });
        } catch {
            setError('Failed Google Authentication');
        }

        setLoading(false)
    }
    async function handleGithubSignIn(e) {
        e.preventDefault();
        try {
            setError('')
            setLoading(true)
            await signInWithPopup(auth, githubProvider).then((result) => {
                const user = result.user;
                getDownloadURL(ref(storage, 'defaultPFP.png')).then(url => {
                    updateProfile(user, { photoURL: url })
                })
                sendEmailVerification(user)
                history.push('/')
            });
        } catch {
            setError('Failed Github Authentication');
        }

        setLoading(false)
    }

    return (
        <>
            <Card>
                <Card.Body>
                    <h2 classname="text-center mb-4">Log In</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required />
                        </Form.Group>
                        <Form.Group id="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" ref={passwordRef} required />
                        </Form.Group>
                        <br></br>
                        <Button disabled={loading} type="submit">
                            Log In
                        </Button>
                    </Form>
                    <div className="text-center">
                        <br /><br />
                        <Button disabled={loading} onClick={handleGoogleSignIn} variant="danger">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt='' width={30} height={30} align="left" /> &nbsp; Sign In with Google
                        </Button>
                        <br /><br />
                        <Button disabled={loading} onClick={handleGithubSignIn} variant="dark">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt='' width={30} height={30} align="left" /> &nbsp; Sign In with Github
                        </Button>
                    </div>
                </Card.Body>
            </Card>
            <div className="w-100 text-center mt-2">
                Need an account? <a href="/signup/">Sign Up</a>
            </div>
        </>
    )
}
