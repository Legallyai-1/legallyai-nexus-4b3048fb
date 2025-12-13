import React, { useState } from 'react';

const hubs = [
  { id: 'lee', name: 'Lee Legal AI', icon: '👨‍⚖️', greeting: 'Hi! I am Lee, your general legal assistant. How can I help?', color: 'indigo' },
  { id: 'custody', name: 'CustodiAI', icon: '👨‍👩‍👧‍👦', greeting: 'Hi! I am CustodiAI, your child custody specialist. What do you need?', color: 'green' },
  { id: 'marriage', name: 'MaryAI', icon: '💒', greeting: 'Hi! I am MaryAI, your marriage and divorce expert. Let\'s get started.', color: 'pink' },
  { id: 'defense', name: 'DefendAI', icon: '⚖️', greeting: 'Hi! I am DefendAI, your criminal defense specialist. How can I assist?', color: 'purple' },
  { id: 'drive', name: 'DriveSafeAI', icon: '🚗', greeting: 'Hi! I am DriveSafeAI, your DUI defense expert. What\'s your situation?', color: 'teal' },
  { id: 'freedom', name: 'Freedom AI', icon: '🔒', greeting: 'Hi! I am Freedom AI, your probation and parole guide. What\'s next?', color: 'orange' },
  { id: 'legacy', name: 'LegacyAI', icon: '🏠', greeting: 'Hi! I am LegacyAI, your wills and estate planner. How can I help?', color: 'blue' },
  { id: 'worker', name: 'Worker Rights', icon: '👷', greeting: 'Hi! I am your worker rights advocate. What issue are you facing?', color: 'yellow' }
];

const OPENAI_API_KEY = 'your-openai-api-key-here'; // Replace with your real key from platform.openai.com/api-keys

export default function App() {
  const [url, setUrl] = useState(window.location.pathname);
  const hubId = url.slice(1);
  const currentHub = hubs.find(h => h.id === hubId);
  const [messages, setMessages] = useState(currentHub ? [{ role: 'ai', text: currentHub.greeting }] : []);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Real OpenAI call
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await response.json();
      const aiMsg = { role: 'ai', text: data.choices[0].message.content };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const aiMsg = { role: 'ai', text: 'Sorry, I had a hiccup. Try again!' };
      setMessages(prev => [...prev, aiMsg]);
    }
  };

  const generateDocument = async () => {
    // Real OpenAI doc generation
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: 'Generate a simple legal document template.' }, { role: 'user', content: 'Create a basic NDA template.' }],
        }),
      });
      const data = await response.json();
      alert(data.choices[0].message.content); // Or download as PDF
    } catch (error) {
      alert('Document generation hiccup. Try again!');
    }
  };

  if (currentHub) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
        <button onClick={() => setUrl('/')} className="mb-6 text-blue-400 text-lg">← Back to Home</button>
        <h1 className="text-4xl font-bold text-center mb-8">{currentHub.name}</h1>
        <div className="text-center mb-8">
          <div className="inline-block p-6 rounded-full bg-gradient-to-r from-{currentHub.color}-600 to-pink-600 shadow-2xl text-8xl">
            {currentHub.icon}
          </div>
        </div>
        <div className="bg-gray-800 rounded-3xl p-6 shadow-2xl">
          <div className="bg-gray-700 rounded-2xl p-6 h-96 overflow-y-auto mb-6">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right mb-6' : 'text-left mb-6'}>
                <span className={`inline-block p-5 rounded-2xl bg-{currentHub.color}-600 text-white shadow-lg`}>
                  {m.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 p-5 bg-gray-800 rounded-l-2xl text-white placeholder-gray-400"
              placeholder="Ask me anything..."
            />
            <button onClick={sendMessage} className="bg-{currentHub.color}-600 px-6 rounded-r-2xl">
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (url === '/start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-12">Where to Start</h1>
        <div className="bg-gray-800 p-10 rounded-3xl w-full max-w-md">
          <p className="text-center text-xl mb-8">Choose your role:</p>
          <button onClick={() => setUrl('/')} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-5 rounded-2xl mb-4 text-2xl shadow-lg">Individual</button>
          <button onClick={() => setUrl('/')} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-5 rounded-2xl mb-4 text-2xl shadow-lg">Business Owner</button>
          <button onClick={() => setUrl('/')} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-5 rounded-2xl text-2xl shadow-lg">Lawyer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-8">LegallyAI</h1>
      <div className="text-center mb-10">
        <button onClick={() => setUrl('/start')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-xl font-semibold shadow-lg">
          Where to Start
        </button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {hubs.map((hub) => (
          <button onClick={() => setUrl('/' + hub.id)} key={hub.id} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-gray-700">
            <div className="text-6xl mb-4">{hub.icon}</div>
            <div className="text-center text-lg font-medium">{hub.name}</div>
          </button>
        ))}
      </div>
      <button onClick={generateDocument} className="fixed bottom-24 right-6 bg-gradient-to-r from-teal-500 to-cyan-500 w-20 h-20 rounded-full shadow-2xl flex items-center justify-center text-5xl z-10 animate-pulse">
        📄
      </button>
    </div>
  );
}
