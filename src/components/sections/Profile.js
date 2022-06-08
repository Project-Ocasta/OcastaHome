import React, { useEffect, useRef, useState } from "react";
import { Card, Button, Stack, CardImg, Modal, Form, Badge } from "react-bootstrap";
import { getAuth, signOut, sendPasswordResetEmail, deleteUser, updateEmail, updateProfile } from "firebase/auth";
import { useHistory } from "react-router-dom";
import { getDownloadURL, getStorage, ref, uploadBytes, deleteObject } from "firebase/storage";
import { doc, getDoc, getFirestore } from "firebase/firestore";

export default function ProfileMenu() {
  const auth = getAuth();
  const history = useHistory();
  const inputFile = useRef(null);
  const storage = getStorage();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [DeleteUsername, setDeleteUsername] = useState("");
  const [roles, setRoles] = useState("");

  const handleCloseUsernameModal = () => setShowUsernameModal(false);
  const handleShowUsernameModal = () => setShowUsernameModal(true);
  const handleCloseEmailModal = () => setShowEmailModal(false);
  const handleShowEmailModal = () => setShowEmailModal(true);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  const handleShowDeleteModal = () => setShowDeleteModal(true);

  const onButtonClick = () => {
    inputFile.current.click();
  };

  async function changeemail(e) {
    e.preventDefault();
    try {
      if (email) {
        await updateEmail(auth.currentUser, email);
        alert("Email changed successfully");
      } else {
        alert("Email is required");
      }
    } catch (error) {
      console.log(error);
      if (error.code === "auth/requires-recent-login") {
        alert("For security reasons, please login again!");
        signOut(auth);
        history.push("/");
      }
      if (error.code === "auth/invalid-email") {
        alert("Invalid email");
      }
      if (error.code === "auth/email-already-in-use") {
        alert("Email already in use");
      }
      if (error.code !== "auth/requires-recent-login" && error.code !== "auth/invalid-email" && error.code !== "auth/email-already-in-use") {
        alert("Error changing email");
      }
    }
  }
  async function changepass(e) {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      alert("Password reset email sent");
    } catch (error) {
      console.log(error);
      alert("Failed to send password reset email");
    }
  }
  async function changeusername(e) {
    e.preventDefault();
    try {
      if (username) {
        await updateProfile(auth.currentUser, { displayName: username });
        alert("Username changed successfully");
      }
    } catch (error) {
      console.log(error);
      alert("Failed to change username");
    }
  }
  async function signout(e) {
    e.preventDefault();
    try {
      await signOut(auth);
      history.push("/");
    } catch (error) {
      console.log(error);
      alert("Failed to sign out");
    }
  }
  async function deleteaccount(e) {
    e.preventDefault();
    if (DeleteUsername === auth.currentUser.displayName) {
      const fileRef = ref(storage, "userdata/" + auth.currentUser.uid + "/profile.png");
      try {
        await deleteUser(auth.currentUser);
        await deleteObject(fileRef);
        history.push("/");
      } catch (error) {
        console.log(error);
        if (error.code === "auth/requires-recent-login") {
          alert("For security reasons, you can only delete your account if you have not signed in for more than 24 hours. Please re-login and try again.");
          signOut(auth);
          history.push("/");
        }
        if (error.code === "auth/user-not-found") {
          alert("User not found");
        }
        if (error.code !== "auth/requires-recent-login" && error.code !== "auth/user-not-found") {
          if (error.code !== "storage/object-not-found") {
            alert("Failed to delete account");
          } else {
            history.push("/");
          }
        }
      }
    } else {
      alert("Account deletion cancelled");
    }
  }
  async function changepfp(e) {
    e.preventDefault();
    const file = inputFile.current.files[0];
    if (file) {
      const fileRef = ref(storage, "userdata/" + auth.currentUser.uid + "/profile.png");
      try {
        await uploadBytes(fileRef, file);
        await getDownloadURL(fileRef).then((url) => {
          updateProfile(auth.currentUser, { photoURL: url })
        })
        alert("Profile picture changed successfully");
        window.location.reload();
      } catch (error) {
        console.log(error);
        alert("Failed to change profile picture");
      }
    } else {
      alert("No file selected");
    }
  }
  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    async function getroles() {
      const docRef = doc(db, "data/users/" + auth.currentUser.uid + "/roles");
      const docSnap = await getDoc(docRef);
      try {
        const rolelist = JSON.stringify(docSnap.data()).replace(/"/g, "").replace("{list:[", "").replace("]}", "").split(",");
        for (let role of rolelist) {
          console.log(role);
          setRoles(rolelist);
        }
      } catch (error) {
        console.log(error);
      }
    }
    getroles();
  }, []);

  return (
    <Card>
      <h2 className="text-center mb-4">Profile Menu</h2>
      <input type="file" ref={inputFile} onChange={changepfp} style={{ display: "none" }} />
      <Stack direction="horizontal">
        <Card.Body className="CardImage" onClick={onButtonClick} style={{ cursor: "pointer" }}>
          <CardImg src={auth.currentUser.photoURL} />
        </Card.Body>
        <Card.Body>
          <h3> Account Info </h3>
          <Stack direction="horizontal" gap={3}>
            <Button variant="primary" onClick={handleShowUsernameModal}>
              Change Username?
            </Button>
            <Button variant="primary" onClick={handleShowEmailModal}>
              Change Email?
            </Button>
            <Button variant="primary" onClick={changepass}>
              Reset Password?
            </Button>
          </Stack>
          <br />
          <h3> Danger Zone </h3>
          <Button variant="outline-danger" onClick={signout}>
            Sign Out?
          </Button>
          <br /><br />
          <Button variant="danger" onClick={handleShowDeleteModal}>
            Delete Account?
          </Button>
        </Card.Body>
      </Stack>
      <h3> Roles </h3>
      {roles && (<Card.Body> {roles.map((role) => { return (<div key={role}> <Badge pill bg="primary"> {role} </Badge> </div>) })} </Card.Body>)}
      {!roles && (<Card.Body> <Badge pill bg="primary"> New User </Badge> </Card.Body>)}

      <Modal show={showEmailModal} onHide={handleCloseEmailModal}>
        <Modal.Header>
          <Modal.Title>Change Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={changeemail}>
            <Form.Group controlId="formBasicUsername">
              <Form.Label>Email</Form.Label>
              <Form.Control type="text" placeholder="Enter new Email" onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={changeemail}>
            Change Email
          </Button>
          <Button variant="secondary" onClick={handleCloseEmailModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showUsernameModal} onHide={handleCloseUsernameModal}>
        <Modal.Header>
          <Modal.Title>Change Username</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={changeusername}>
            <Form.Group controlId="formBasicUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" placeholder="Enter new Username" onChange={(e) => setUsername(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={changeusername}>
            Change Username
          </Button>
          <Button variant="secondary" onClick={handleCloseUsernameModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header>
          <Modal.Title>Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={deleteaccount}>
            <Form.Group controlId="formBasicUsername">
              <Form.Label>Type your Username to Confirm Account Deletion</Form.Label>
              <Form.Control type="text" placeholder={auth.currentUser.displayName} onChange={(e) => setDeleteUsername(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={deleteaccount}>
            Delete Account
          </Button>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </Card>
  );
}
