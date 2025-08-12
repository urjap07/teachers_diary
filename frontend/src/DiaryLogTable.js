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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    // Always fetch all entries for the teacher without date filtering
    let url = 'http://localhost:5000/api/diary-entries';
    if (userId) {
      url += `?user_id=${Number(userId)}`;
    }
    // Explicitly clear any date filters by not including them
    console.log('DiaryLogTable fetching from URL:', url);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log('DiaryLogTable fetched data:', data);
        setEntries(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('DiaryLogTable fetch error:', err);
      });
  }, [userId]);

  // Reset to first page when entries change
  useEffect(() => {
    setCurrentPage(1);
  }, [entries.length]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = entries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(entries.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Calculate totals
  const totalLectures = entries.length;
  const totalHours = entries.reduce((sum, e) => sum + calculateDuration(e.start_time, e.end_time), 0);

  return (
    <div>
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
            {currentItems.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-6 text-blue-400 bg-blue-50">No entries found.</td>
            </tr>
          ) : (
              currentItems.map((e, idx) => (
              <tr
                key={e.id}
                className={
                  `hover:bg-blue-100 transition ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-blue-100'}`
                }
              >
                <td className="px-4 py-2 border-b border-blue-100 text-blue-900">{new Date(e.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 border-b border-blue-100 text-blue-900">{e.course_name || e.course_id}</td>
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
      {/* Pagination Controls */}
      {entries.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-4 px-4">
          <div className="text-sm text-gray-700">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, entries.length)} of {entries.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border border-blue-300 bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-lg border ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-blue-300 bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border border-blue-300 bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 