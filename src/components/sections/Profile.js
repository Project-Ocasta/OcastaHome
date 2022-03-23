import React, { useRef } from "react";
import { Card, Button, Stack, CardImg } from "react-bootstrap";
import { getAuth, signOut, sendPasswordResetEmail, deleteUser, updateEmail, updateProfile } from "firebase/auth";
import { useHistory } from "react-router-dom";
import { getDownloadURL, getStorage, ref, uploadBytes, deleteObject } from "firebase/storage";

export default function ProfileMenu() {
  const auth = getAuth();
  const history = useHistory();
  const inputFile = useRef(null);
  const storage = getStorage();

  const onButtonClick = () => {
    inputFile.current.click();
  };

  async function changeemail(e) {
    e.preventDefault();
    const email = prompt("Enter new email");
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
    const username = prompt("Enter new username");
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
    if (prompt("Are you sure you want to delete your account? Type '" + auth.currentUser.displayName + "' to confirm.") === auth.currentUser.displayName) {
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
        if (error.code !== "auth/requires-recent-login" && error.code !== "auth/user-not-found" && error.code !== "storage/object-not-found") {
          alert("Failed to delete account");
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
        getDownloadURL(fileRef).then((url) => {
          updateProfile(auth.currentUser, { photoURL: url })
        })
        alert("Profile picture changed successfully");
      } catch (error) {
        console.log(error);
        alert("Failed to change profile picture");
      }
    } else {
      alert("No file selected");
    }
  }

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
            <Button variant="primary" onClick={changeusername}>
              Change Username?
            </Button>
            <Button variant="primary" onClick={changeemail}>
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
          <Button variant="danger" onClick={deleteaccount}>
            Delete Account?
          </Button>
        </Card.Body>
      </Stack>
    </Card>
  );
}
