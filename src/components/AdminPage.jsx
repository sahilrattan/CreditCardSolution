import { useEffect, useState } from "react";
import styles from "./styles/AdminPage.module.css";

const AdminPage = () => {
  const [signupUsers, setSignupUsers] = useState([]);
  const [cardApplicants, setCardApplicants] = useState([]);
  const [statusUpdateMsg, setStatusUpdateMsg] = useState("");
  const [loading, setLoading] = useState({
    users: true,
    applicants: true
  });
  const [error, setError] = useState({
    users: null,
    applicants: null
  });

  // Fetch Signup Users
  const fetchSignupUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      setError(prev => ({ ...prev, users: null }));

      const res = await fetch("http://localhost:5000/api/users");
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
      
      const data = await res.json();
      setSignupUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(prev => ({ ...prev, users: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // Fetch Credit Card Applicants
  const fetchApplicants = async () => {
    try {
      setLoading(prev => ({ ...prev, applicants: true }));
      setError(prev => ({ ...prev, applicants: null }));

      const res = await fetch("http://localhost:5000/api/credit-card-applications");
      if (!res.ok) throw new Error(`Failed to fetch applicants: ${res.status}`);

      const data = await res.json();
      setCardApplicants(data);
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setError(prev => ({ ...prev, applicants: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, applicants: false }));
    }
  };

  // Update Verification Status
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/credit-card-applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error(`Status update failed: ${res.status}`);

      const result = await res.json();
      setStatusUpdateMsg(result.message || "Status updated successfully!");
      setTimeout(() => setStatusUpdateMsg(""), 3000);
      fetchApplicants();
    } catch (err) {
      console.error("Status update error:", err);
      setStatusUpdateMsg(`Error: ${err.message}`);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error(`Failed to delete user: ${res.status}`);

        setSignupUsers(prev => prev.filter(user => user.id !== id));
        setStatusUpdateMsg("User deleted successfully!");
        setTimeout(() => setStatusUpdateMsg(""), 3000);
      } catch (err) {
        console.error("Error deleting user:", err);
        setStatusUpdateMsg(`Error: ${err.message}`);
      }
    }
  };

  useEffect(() => {
    fetchSignupUsers();
    fetchApplicants();
  }, []);

  return (
    <div className={styles.adminPage}>
      <h1>Admin Dashboard</h1>

      {/* Status Message */}
      {statusUpdateMsg && (
        <div className={`${styles.statusMsg} ${statusUpdateMsg.includes('Error') ? styles.error : styles.success}`}>
          {statusUpdateMsg}
        </div>
      )}

      {/* Signup Users */}
      <section>
        <h2>Signup Users</h2>
        {loading.users ? (
          <div className={styles.loading}>Loading users...</div>
        ) : error.users ? (
          <div className={styles.error}>Error: {error.users}</div>
        ) : signupUsers.length === 0 ? (
          <div className={styles.noData}>No signup users found.</div>
        ) : (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {signupUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.editBtn}>Edit</button>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Credit Card Applicants */}
      <section>
        <h2>Credit Card Applicants</h2>
        {loading.applicants ? (
          <div className={styles.loading}>Loading applicants...</div>
        ) : error.applicants ? (
          <div className={styles.error}>Error: {error.applicants}</div>
        ) : cardApplicants.length === 0 ? (
          <div className={styles.noData}>No applicants yet.</div>
        ) : (
          <>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Name</th>
                  <th>Card</th>
                  <th>Status</th>
                  <th>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {cardApplicants.map(app => (
                  <tr key={app.id}>
                    <td>{app.id}</td>
                    <td>{app.full_name}</td>
                    <td>{app.card_type}</td>
                    <td>
                      <span className={`status-${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        className={styles.statusSelect}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminPage;