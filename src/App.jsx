import React, { useState } from 'react';
    import './index.css';

    const colorPalette = ['#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161'];

    function formatDuration(duration) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.round(duration % 60);
      return `${minutes}m ${seconds}s`;
    }

    function App() {
      const [entries, setEntries] = useState([]);
      const [currentEntry, setCurrentEntry] = useState('');
      const [startTime, setStartTime] = useState(null);
      const [currentColorIndex, setCurrentColorIndex] = useState(0);

      const handleKeyDown = (event) => {
        if (event.key === 'Enter' && event.shiftKey) {
          addEntry();
        } else if (event.key === 'Enter' && event.ctrlKey) {
          endPomodoro();
        }
      };

      const addEntry = () => {
        if (!currentEntry.trim()) return; // Don't log empty entries
        const endTime = new Date();
        const duration = startTime ? (endTime - startTime) / 1000 : 0; // in seconds
        setEntries((prevEntries) => [
          ...prevEntries,
          { text: currentEntry, endTime, duration, color: colorPalette[currentColorIndex] },
        ]);
        setCurrentEntry('');
        setCurrentColorIndex((prevIndex) => (prevIndex + 1) % colorPalette.length);
      };

      const endPomodoro = () => {
        if (!startTime) return;
        const endTime = new Date();
        const duration = (endTime - startTime) / 1000; // in seconds
        setEntries((prevEntries) => [
          ...prevEntries,
          { text: `End of ${formatDuration(duration)} Pomodoro session`, endTime, duration, color: '#FF8A65' },
        ]);
        setCurrentEntry('');
        setStartTime(null);
      };

      const startPomodoro = (duration) => {
        const startTime = new Date();
        setStartTime(startTime);
        setEntries((prevEntries) => [
          ...prevEntries,
          { text: `Starting Pomodoro Session (${duration}m)`, endTime: startTime, duration: 0, color: '#FF8A65' },
        ]);
        setCurrentEntry('');
      };

      const saveToOPML = () => {
        let opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Activity Log</title>
  </head>
  <body>
`;

        entries.forEach((entry) => {
          if (entry.text.includes('Pomodoro Session')) {
            opmlContent += `    <outline text="${entry.text}">
`;
          }
          opmlContent += `      <outline text="${entry.text}" note="Duration: ${formatDuration(entry.duration)}, End Time: ${entry.endTime.toLocaleString()}"/>
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

      const openLogInNewTab = () => {
        const logData = JSON.stringify(entries, null, 2);
        const blob = new Blob([logData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      };

      return (
        <div className="app">
          <button onClick={() => startPomodoro(25)}>Start 25min Pomodoro</button>
          <button onClick={() => startPomodoro(55)}>Start 55min Pomodoro</button>
          <button onClick={saveToOPML}>Save to OPML</button>
          <button onClick={openLogInNewTab}>Open Log in New Tab</button>
          <textarea
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your activity here..."
            rows="4"
            cols="50"
          />
          {entries.map((entry, index) => (
            <div key={index} className="note-card" style={{ backgroundColor: entry.color }}>
              <p><strong>Duration:</strong> {formatDuration(entry.duration)}</p>
              <p><strong>End Time:</strong> {entry.endTime.toLocaleString()}</p>
              <hr />
              <p>{entry.text}</p>
            </div>
          ))}
        </div>
      );
    }

    export default App;
