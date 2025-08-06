import React, { useState, useEffect } from "react";
import { Trash2, Edit3 } from "lucide-react";

const dummyUsers = [
  { id: 1, name: "Ravi Kumar", email: "ravi@example.com", role: "User" },
  { id: 2, name: "Anita Sharma", email: "anita@example.com", role: "Admin" },
  { id: 3, name: "John Doe", email: "john@example.com", role: "User" },
];

const UsersList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Simulating API call
    setUsers(dummyUsers);
  }, []);

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (confirmDelete) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  const handleEdit = (id) => {
    alert(`Edit functionality for user ID: ${id} (To be implemented)`);
  };

  return (
    <div className="mt-18">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Manage Users
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border bg-white rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.role}</td>
                <td className="py-3 px-4 space-x-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => handleEdit(user.id)}
                  >
                    <Edit3 className="inline h-5 w-5" />
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="inline h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersList;
