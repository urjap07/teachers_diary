import React, { useEffect, useState } from 'react';

function calculateDuration(start, end) {
  // start and end are strings like '10:00', '11:30'
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
}

export default function DiaryLogTable({ userId }) {
  const [entries, setEntries] = useState([]);
  useEffect(() => {
    let url = 'http://localhost:5000/api/diary-entries';
    if (userId) {
      url += `?user_id=${Number(userId)}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => setEntries(Array.isArray(data) ? data : []));
  }, [userId]);

  // Calculate totals
  const totalLectures = entries.length;
  const totalHours = entries.reduce((sum, e) => sum + calculateDuration(e.start_time, e.end_time), 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-4 border-blue-600 rounded-lg shadow-md overflow-hidden">
        <thead className="bg-blue-200">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900 uppercase">Date</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900 uppercase">Course</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900 uppercase">Subject</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900 uppercase">Topic</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900 uppercase">Remarks</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900 uppercase">Lecture Number</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900 uppercase">Lecture Duration (hrs)</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-6 text-blue-400 bg-blue-50">No entries found.</td>
            </tr>
          ) : (
            entries.map((e, idx) => (
              <tr
                key={e.id}
                className={
                  `hover:bg-blue-100 transition ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-blue-100'}`
                }
              >
                <td className="px-4 py-2 border-b border-blue-100 text-blue-900">{new Date(e.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 border-b border-blue-100 text-blue-900">{e.course_id}</td>
                <td className="px-4 py-2 border-b border-blue-100 text-blue-900">{e.subject}</td>
                <td className="px-4 py-2 border-b border-blue-100 text-blue-900">{e.topic_covered}</td>
                <td className="px-4 py-2 border-b border-blue-100 text-blue-900">{e.remarks}</td>
                <td className="px-4 py-2 border-b border-blue-100 text-blue-900">{e.lecture_number}</td>
                <td className="px-4 py-2 border-b border-blue-100 text-blue-900">{calculateDuration(e.start_time, e.end_time).toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
        {entries.length > 0 && (
          <tfoot>
            <tr className="bg-blue-100 font-semibold">
              <td colSpan={5} className="px-4 py-2 text-right border-b border-blue-100 text-blue-900">Total:</td>
              <td className="px-4 py-2 border-b border-blue-100 text-blue-900">{totalLectures}</td>
              <td className="px-4 py-2 border-b border-blue-100 text-blue-900">{totalHours.toFixed(2)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
} 