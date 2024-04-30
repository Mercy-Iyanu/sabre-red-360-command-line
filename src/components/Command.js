import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPaperPlane, faHistory } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import axios from 'axios';
import '../App.css';

export default function Command() {
    const [inputText, setInputText] = useState('');
    const [response, setResponse] = useState('');
    const [token, setToken] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Fetch token when the component mounts
        const fetchToken = async () => {
            try {
                const tokenResponse = await axios.get('http://localhost:3000/api/sabre/token');
                setToken(tokenResponse.data.token);
            } catch (error) {
                console.error('Error fetching token:', error);
            }
        };

        fetchToken();

        // Start a timer to send a ping request every 14 minutes
        const pingInterval = setInterval(async () => {
            try {
                await axios.post('http://localhost:3000/api/sabre/ping');
                console.log('Session ping sent successfully.');
            } catch (error) {
                console.error('Error sending session ping:', error);
            }
        }, 14 * 60 * 1000);

        return () => clearInterval(pingInterval);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        let config = {
            method: "POST",
            url: "http://localhost:3000/api/sabre",
            data: {
                inputText: inputText
            },
            headers: {
                'Authorization': token // Use token in the request header
            }
        };

        try {
            const { data } = await axios(config);
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            const responseElement = xmlDoc.getElementsByTagName('Response')[0];
            const responseText = responseElement.textContent;

            setResponse(`${inputText}\n\n${responseText}`);

            setInputText('');
            
        } catch (error) {
            console.error(error);
            setResponse('Something went wrong');
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === "'") {
            setInputText((prevInputText) => prevInputText + '¥');
            event.preventDefault();
        }
        else if (event.key === "\\") {
            setInputText((prevInputText) => prevInputText + '§');
            
            event.preventDefault();
        }
        else if (event.key === "[") {
            setInputText((prevInputText) => prevInputText + '¤');
            event.preventDefault();
        }
        else if (event.key === "=") {
            setInputText((prevInputText) => prevInputText + '*');
            event.preventDefault();
        }
        else if (event.ctrlKey && event.key === 'Backspace') {
            setInputText('');
            event.preventDefault();
        }
    };

    const toggleDropdown = () => setIsOpen(!isOpen);
    const profileData = {
        name: 'Mercy Oyelude',
        email: 'mercyoyelude0@gmail.com',
        settings: 'Settings',
        logout: 'Logout',
    };

    return (
        <div>
            <nav className="navbar navbar-expand-sm bg-light justify-content-between">
                <form action='http://localhost:3000/api/sabre' className="input-group container-fluid" onSubmit={handleSubmit} method='post'>
                    <DropdownButton 
                        variant="light"
                        title={<FontAwesomeIcon icon={faUser} />}
                        open={isOpen}
                        onToggle={toggleDropdown}
                    >
                        <Dropdown.Item href="#"> 
                            {profileData.name} <br /> {profileData.email} <br /> {profileData.settings} <br /> {profileData.logout}
                        </Dropdown.Item>
                        </DropdownButton>
                    <input
                        type="text"
                        className="form-control fw-bold"
                        placeholder="TYPE YOUR COMMAND HERE"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        style={{ border: 'none', textTransform: 'uppercase' }}
                    />
                    <button
                        className="btn"
                        data-bs-toggle="tooltip" 
                        title="Send"
                        type="submit"
                        style={{ backgroundColor: 'gray', color: 'white' }}
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                    <div className="dropdown">
                        <button
                            className="btn dropdown-toggle"
                            data-bs-toggle="tooltip dropdown" 
                            title="History"
                            style={{ backgroundColor: 'gray', color: 'white' }}
                        >
                            <FontAwesomeIcon icon={faHistory} />
                        </button>
                        <ul class="dropdown-menu">
                            <li><span className="dropdown-item-text">Just Text</span></li>
                        </ul>
                    </div>
                </form>
            </nav>
            <div 
                id="show-us" 
                className="sabre-command"
                style={{ textTransform: 'uppercase' }}
            >
                <pre>
                    {response}
                </pre>
            </div>
        </div >
    );
}