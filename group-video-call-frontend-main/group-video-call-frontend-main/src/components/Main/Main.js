import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import socket from '../../socket';

const Main = (props) => {
  const roomRef = useRef()
  const userRef = useRef()
  const [email,setEmail]=useState('')
  const [name,setName]=useState('')
  const [err, setErr] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [loggedIn,setLoggedIn]=useState(false)

  useEffect(()=>{
		setEmail(JSON.parse(localStorage.getItem('myEmail')))
    setLoggedIn(localStorage.getItem('isLoggedIn'))
	},[setEmail])

  useEffect(() => {
		// Fetch user name by email
		fetch(`https://group-call-backend.onrender.com/user/${email}`)
		  .then(response => response.json())
		  .then(data => {
			if (data.error) {
			  console.error(data.error);
			} else {
			  setName(data.name);
			}
		  })
		  .catch(error => console.error('Error fetching user by email:', error));
		  localStorage.setItem('myName', JSON.stringify(name))
	  }, [email,name])




  useEffect(() => {

    socket.on('FE-error-user-exist', ({ error }) => {
      if (!error) {
        const roomName = roomRef.current.value
        const userName = userRef.current.value

        sessionStorage.setItem('user', userName)
        props.history.push(`/room/${roomName}`)
      } else {
        setErr(error)
        setErrMsg('User name already exist')
      }
    })
  }, [props.history])



  function clickJoin() {
    const roomName = roomRef.current.value;
    const userName = userRef.current.value;
    console.log(roomName)
    console.log(userName)
    if (!roomName || !userName) {
      setErr(true);
      setErrMsg('Enter Room Name or User Name');
    } else {
      socket.emit('BE-check-user', { roomId: roomName, userName });
    }
  }

  return (
    <div>
      {loggedIn && <div>
        {name}
        <div onClick={()=>{
          props.history.push('/signin')
          localStorage.clear()
        }}>logout</div>
      </div>}
      {!loggedIn && <div>
          <div onClick={()=>props.history.push('/signin')}>Sign In</div>
          <div onClick={()=>props.history.push('/signup')}>Sign Up</div>
        </div>}
    <MainContainer>
      <Row>
        <Label htmlFor="roomName">Room Name</Label>
        <Input type="text" id="roomName" ref={roomRef} />
      </Row>
      <Row>
        <Label htmlFor="userName">User Name</Label>
        <Input type="text" id="userName" ref={userRef} value={name} onChange={(e)=>setName(e.target.value)}/>
      </Row>
      <JoinButton onClick={clickJoin}> Join </JoinButton>
      {err ? <Error>{errMsg}</Error> : null}
    </MainContainer>
    </div>
  );
};

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 15px;
  line-height: 35px;
`;

const Label = styled.label``;

const Input = styled.input`
  width: 150px;
  height: 35px;
  margin-left: 15px;
  padding-left: 10px;
  outline: none;
  border: none;
  border-radius: 5px;
`;

const Error = styled.div`
  margin-top: 10px;
  font-size: 20px;
  color: #e85a71;
`;

const JoinButton = styled.button`
  height: 40px;
  margin-top: 35px;
  outline: none;
  border: none;
  border-radius: 15px;
  color: #d8e9ef;
  background-color: #4ea1d3;
  font-size: 25px;
  font-weight: 500;

  :hover {
    background-color: #7bb1d1;
    cursor: pointer;
  }
`;

export default Main;
