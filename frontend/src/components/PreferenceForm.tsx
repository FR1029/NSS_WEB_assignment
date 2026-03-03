import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import type { SubmissionPayload, Category } from "../types";

const API_BASE = "http://localhost:5001";

const DEADLINE = new Date("2026-03-03T21:55:00").getTime(); 

const PreferenceForm = () => {
  const [username, setUsername] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isClosed, setIsClosed] = useState<boolean>(false);

  useEffect(() => {
    if (Date.now() > DEADLINE) {
      setIsClosed(true);
      return;
    }

    const timeUntilClose = DEADLINE - Date.now();
    const timer = setTimeout(() => {
      setIsClosed(true);
    }, timeUntilClose);

    axios.get<Category[]>(`${API_BASE}/categories`).then((res) => {
      setCategories(res.data);
      setPreferences(new Array(res.data.length).fill(""));
    }).catch((err) => console.error(err));
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    const updated = [...preferences];
    updated[index] = value;
    setPreferences(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim()) {
      setMessage("Username is required");
      return;
    }

    if (preferences.includes("")) {
      setMessage("All preferences must be selected");
      return;
    }

    const unique = new Set(preferences);
    if (unique.size !== preferences.length) {
      setMessage("Preferences must be unique");
      return;
    }

    const payload: SubmissionPayload = {
      username,
      preferences,
    };

    try {
      await axios.post(`${API_BASE}/submit`, payload);
      setMessage("Submitted successfully!");
      setUsername("");
      setPreferences(new Array(categories.length).fill(""));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 403) {
          setMessage(error.response.data.message);
          setIsClosed(true); 
        } else {
          setMessage(error.response.data.error);
        }
      } else {
        setMessage("An unexpected error occurred.");
      }
    }
  };

  if (isClosed) {
    return (
      <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #ffcccc", backgroundColor: "#ffe6e6", borderRadius: "8px" }}>
        <h3 style={{ color: "#cc0000", margin: 0 }}>Deadline reached. Submissions are now closed.</h3>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "20px" }}>
        <label>Name: </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <h4>Rank Categories</h4>

      {categories.map((_, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <label>Preference {index + 1}: </label>
          <select
            value={preferences[index]}
            onChange={(e) => handleChange(index, e.target.value)}
          >
            <option value="">Select</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      ))}
      <button type="submit">Submit</button>
      <p style={{ 
        fontWeight: "bold", 
        color: message.includes("successfully") ? "green" : "red" 
      }}>
        {message}
      </p>
    </form>
  );
};

export default PreferenceForm;