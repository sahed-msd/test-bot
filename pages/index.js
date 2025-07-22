// pages/index.js
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatBoxRef = useRef(null);

  // Predefined answers server-side mimic করার জন্য, এখানে শুধু UI তে দেখানো হবে।
  // মুল লজিক server-side থাকবে, তাই client শুধু পাঠাবে ও রিসিভ করবে।
  const predefinedAnswers = {
    "রোজা": "রোজা বা সিয়াম ইসলামের একটি গুরুত্বপূর্ণ ইবাদত।",
    "hi": "এসব না বলে সরাসরি বলেন কি দরকার",
    "hello": "Hello, how can I assist you today?",
    "price": "Our current price list is available on our website.",
    "contact": "You can contact us via email or phone.",
    "bye": "Thank you for chatting with us. Have a great day!"
  };

  // ChatBox scroll to bottom on new message
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Append message helper
  const appendMessage = (msg, sender) => {
    setMessages(prev => [...prev, { text: msg, sender }]);
  };

  // Clean & correct input (optional, could move to server if preferred)
  const cleanInput = (input) => input.toLowerCase().replace(/[^a-zA-Z0-9অ-হা-৳ ]/g, '').trim();
  const correctSpelling = (input) => {
    const corrections = { "রজা": "রোজা", "রুজা": "রোজা", "rozha": "রোজা", "roja": "রোজা", "roza": "রোজা" };
    return corrections[input] || input;
  };

  // Client-side handler: POST to serverless API
  const sendMessage = async () => {
    if (!input.trim()) return;

    appendMessage(input, 'user');
    const userMessage = input;
    setInput('');

    // Fetch user IP (optional)
    let userIP = 'IP_FETCH_FAILED';
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      userIP = ipData.ip;
    } catch {}

    // Call Next.js API route
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, ip: userIP })
      });
      const data = await res.json();

      // Bot reply: যদি server থেকে ঠিকঠাক উত্তর না আসে, fallback দেখান
      let botReply = "আপনার প্রশ্নটি পেয়েছি, শীঘ্রই উত্তর দেওয়া হবে।";

      // এখানে আপনি চাইলে সার্ভার সাইডে predefined logic রাখতে পারেন,
      // অথবা ক্লায়েন্ট সাইডে হালকা জিনিস দেখাতে পারেন:
      const cleaned = cleanInput(userMessage);
      const corrected = correctSpelling(cleaned);
      for (const key in predefinedAnswers) {
        if (corrected.includes(key.toLowerCase())) {
          botReply = predefinedAnswers[key];
          break;
        }
      }

      appendMessage(botReply, 'bot');
    } catch (error) {
      appendMessage('দুঃখিত, সার্ভার সমস্যা হচ্ছে। আবার চেষ্টা করুন।', 'bot');
      console.error(error);
    }
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#17212b',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.4)',
        width: '100%',
        maxWidth: 400,
        height: '100%',
        maxHeight: 720,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <header style={{
          backgroundColor: '#2c3b4a',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          padding: 10
        }}>
          <button style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 20,
            cursor: 'pointer',
            padding: 5
          }}>←</button>
          <img src="spycode.png" alt="Logo" style={{ width: 40, height: 40, borderRadius: '50%', margin: '0 10px' }} />
          <div style={{ flexGrow: 1, fontWeight: 'bold', fontSize: 16 }}>SpyCode</div>
          <button style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 20,
            cursor: 'pointer',
            padding: 5
          }}>📞</button>
          <button style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 24,
            cursor: 'pointer',
            padding: 5
          }}>⋮</button>
        </header>

        <main ref={chatBoxRef} style={{
          flex: 1,
          overflowY: 'auto',
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          scrollBehavior: 'smooth',
          color: '#fff'
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              maxWidth: '70%',
              padding: '10px 14px',
              borderRadius: 18,
              fontSize: 14,
              lineHeight: 1.4,
              wordWrap: 'break-word',
              color: '#fff',
              backgroundColor: msg.sender === 'user' ? '#39a3ff' : '#505f6e',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeIn 0.3s ease'
            }}>
              {msg.text}
            </div>
          ))}
        </main>

        <footer style={{
          display: 'flex',
          padding: 8,
          backgroundColor: '#2c3b4a'
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Message"
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: '#3b4b5a',
              border: 'none',
              borderRadius: 20,
              color: '#fff',
              fontSize: 14,
              outline: 'none'
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') sendMessage();
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              background: 'none',
              border: 'none',
              color: '#39a3ff',
              fontSize: 24,
              cursor: 'pointer',
              padding: '0 10px'
            }}
          >➤</button>
        </footer>
      </div>
    </div>
  );
}

