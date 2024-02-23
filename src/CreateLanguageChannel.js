// import React, { useState } from 'react';
// import { createSession, Session, Participant } from '@vonage/video-api';

// const ChannelCreate = () => {
//   const [channelName, setChannelName] = useState('');
//   const [session, setSession] = useState(null);

//   const handleChannelCreate = async () => {
//     if (!channelName) {
//       return alert('Please enter a channel name');
//     }

//     try {
//       // Replace with your Vonage API key and secret
//       const apiKey = 'YOUR_API_KEY';
//       const apiSecret = 'YOUR_API_SECRET';

//       const session = await createSession({ apiKey, apiSecret });
//       setSession(session);

//       // Create a new channel within the session
//       const channel = await session.channel.create({ name: channelName });

//       // Join the channel as a participant
//       const participant = await channel.participant.create();

//       // Handle successful channel creation and joining
//       console.log('Channel created and joined successfully:', channel.id);
//       // ... (e.g., redirect to the newly created channel)
//     } catch (error) {
//       console.error('Error creating channel:', error);
//       alert('Failed to create channel: ' + error.message);
//     }
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         value={channelName}
//         onChange={(e) => setChannelName(e.target.value)}
//         placeholder="Enter channel name"
//       />
//       <button onClick={handleChannelCreate}>Create Channel</button>
//     </div>
//   );
// };

// export default ChannelCreate;
