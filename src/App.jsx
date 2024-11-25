import React, { useState } from 'react';
    import './index.css';

    const colorPalette = ['#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161'];

    function formatDuration(duration) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.round(duration % 60);
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      return `${seconds}s`;
    }

    function App() {
      const [entries, setEntries] = useState([]);
      const [currentEntry, setCurrentEntry] = useState('');
      const [startTime, setStartTime] = useState(new Date());
      const [currentColorIndex, setCurrentColorIndex] = useState(0);
      const [pomodoroSessions, setPomodoroSessions] = useState([]);
      const [currentSessionId, setCurrentSessionId] = useState(null);

      const handleKeyDown = (event) => {
        if (event.key === 'Enter' && event.shiftKey) {
          addEntry();
        } else if (event.key === 'Enter' && event.ctrlKey) {
          endPomodoro();
        }
      };

      const addEntry = () => {
        if (!currentSessionId) return;
        const endTime = new Date();
        const duration = (endTime - startTime) / 1000; // in seconds
        setEntries((prevEntries) => [
          ...prevEntries,
          { text: currentEntry, endTime, duration, color: colorPalette[currentColorIndex], sessionId: currentSessionId },
        ]);
        setCurrentEntry('');
        setStartTime(new Date());
        setCurrentColorIndex((prevIndex) => (prevIndex + 1) % colorPalette.length);
      };

      const endPomodoro = () => {
        if (!currentSessionId) return;
        setEntries((prevEntries) => [
          ...prevEntries,
          { text: 'End of Pomodoro Session', endTime: new Date(), duration: 0, color: '#FF8A65', sessionId: currentSessionId },
        ]);
        setCurrentSessionId(null);
      };

      const startPomodoro = (duration) => {
        const sessionId = `session-${Date.now()}`;
        setPomodoroSessions((prevSessions) => [...prevSessions, { id: sessionId, duration }]);
        setCurrentSessionId(sessionId);
        setCurrentEntry(`Pomodoro Session (${duration}m)`);
        addEntry();
      };

      const saveToOPML = () => {
        let opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Activity Log</title>
  </head>
  <body>
`;

        pomodoroSessions.forEach((session) => {
          opmlContent += `    <outline text="Pomodoro Session (${session.duration}m)">
`;
          entries
            .filter((entry) => entry.sessionId === session.id)
            .forEach((entry) => {
              if (entry.text.includes('End of Pomodoro Session')) return;
              opmlContent += `      <outline text="${entry.text}" note="Duration: ${formatDuration(entry.duration)}, End Time: ${entry.endTime.toLocaleString()}"/>
`;
            });
          opmlContent += `    </outline>
`;
        });

        opmlContent += `  </body>
</opml>`;

        const blob = new Blob([opmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'activity_log.opml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      return (
        <div className="app">
          <button onClick={() => startPomodoro(25)}>Start 25min Pomodoro</button>
          <button onClick={() => startPomodoro(55)}>Start 55min Pomodoro</button>
          <button onClick={saveToOPML}>Save to OPML</button>
          <textarea
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your activity here..."
            rows="4"
            cols="50"
          />
          {pomodoroSessions.map((session) => (
            <div key={session.id} className="session-header">
              <h2>Pomodoro Session ({session.duration}m)</h2>
              {entries
                .filter((entry) => entry.sessionId === session.id)
                .map((entry, index) => (
                  <div key={index} className="note-card" style={{ backgroundColor: entry.color }}>
                    <p><strong>Duration:</strong> {formatDuration(entry.duration)}</p>
                    <p><strong>Start Time:</strong> {startTime.toLocaleString()}</p>
                    <p><strong>End Time:</strong> {entry.endTime.toLocaleString()}</p>
                    <hr />
                    <p>{entry.text}</p>
                  </div>
                ))}
            </div>
          ))}
        </div>
      );
    }

    export default App;
