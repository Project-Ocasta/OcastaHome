import React, { useRef, useState } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { useHistory } from 'react-router-dom'
import { getAuth, sendEmailVerification, updateProfile, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "firebase/auth"
import { getStorage, ref, getDownloadURL } from "firebase/storage"
import { doc, getDoc } from "firebase/firestore"
import { db } from '../../firebase'

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
                const docRef = doc(db, "data/users/" + user.uid + "/other");
                const docSnap = getDoc(docRef);
                if (!user.photoURL) {
                    getDownloadURL(ref(storage, 'defaultPFP.png')).then(url => {
                        updateProfile(user, { photoURL: url })
                    })
                }
                if (!docSnap.SignedUp) {
                    sendEmailVerification(user);
                    db.collection('data').doc('users').collection(user.uid).doc('other').set({
                        SignedUp: true
                    })
                    db.collection('data').doc('users').collection(user.uid).doc('roles').set({
                        list: ["New User"],
                    })
                }
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
                const docRef = doc(db, "data/users/" + user.uid + "/other");
                const docSnap = getDoc(docRef);
                if (!user.photoURL) {
                    getDownloadURL(ref(storage, 'defaultPFP.png')).then(url => {
                        updateProfile(user, { photoURL: url })
                    })
                }
                if (!docSnap.SignedUp) {
                    sendEmailVerification(user);
                    db.collection('data').doc('users').collection(user.uid).doc('other').set({
                        SignedUp: true
                    })
                    db.collection('data').doc('users').collection(user.uid).doc('roles').set({
                        list: ["New User"],
                    })
                }
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
                    <h2 className="text-center mb-4">Log In</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form className='AuthForm' onSubmit={handleSubmit}>
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
                    <br /><br />
                    <Button disabled={loading} onClick={handleGoogleSignIn} variant="dark" className='buttons'>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt='' className='logos' /> &nbsp; Sign In with Google
                    </Button>
                    <br /><br />
                    <Button disabled={loading} onClick={handleGithubSignIn} variant="light" className='buttons'>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt='' className='logos' /> &nbsp; Sign In with Github
                    </Button>
                </Card.Body>
            </Card>
            <div className="w-100 text-center mt-2">
                Need an account? <a href="/signup/">Sign Up</a>
            </div>
        </>
    )
}
