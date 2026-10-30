
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  getItems,
  getMyReports,
  createItem,
  updateItemStatus,
  deleteItem,
} from "./services/api.js";

import { findMatches } from "./utils/matching.js";
import Claims from "./Claims.jsx";
import "./Dashboard.css";

const initialForm = {
  title: "",
  description: "",
  category: "Electronics",
  type: "lost",
  location: "",
  date: new Date().toISOString().slice(0, 10),
  image: null,
};

function Dashboard({ user, onLogout, theme = "light", onToggleTheme }) {
  const [items, setItems] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const userId = user?._id || user?.id;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [itemsResponse, reportsResponse] = await Promise.all([
        getItems(),
        getMyReports(),
      ]);

      setItems(
        Array.isArray(itemsResponse)
          ? itemsResponse
          : itemsResponse?.items || []
      );

      setMyReports(
        Array.isArray(reportsResponse)
          ? reportsResponse
          : reportsResponse?.items || []
      );
    } catch (err) {
      setError(err.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const isOwner = (item) => {
    const reporter = item?.reportedBy;
    const reporterId =
      typeof reporter === "object"
        ? reporter?._id || reporter?.id
        : reporter;

    return Boolean(
      userId &&
      reporterId &&
      String(userId) === String(reporterId)
    );
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "lost" &&
          item.type === "lost" &&
          item.status === "active") ||
        (activeTab === "found" &&
          item.type === "found" &&
          item.status === "active") ||
        (activeTab === "returned" && item.status === "returned");

      const matchesCategory =
        category === "all" ||
        item.category?.toLowerCase() === category.toLowerCase();

      const term = search.trim().toLowerCase();

      const matchesSearch =
        !term ||
        [item.title, item.description, item.location, item.category].some(
          (value) => value?.toLowerCase().includes(term)
        );

      return matchesTab && matchesCategory && matchesSearch;
    });
  }, [items, activeTab, category, search]);

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category).filter(Boolean))],
    [items]
  );

  const matches = useMemo(
    () => findMatches(items.filter((item) => item.status === "active")),
    [items]
  );

  const activeCount = items.filter(
    (item) => item.status === "active"
  ).length;

  const lostCount = items.filter(
    (item) => item.type === "lost" && item.status === "active"
  ).length;

  const foundCount = items.filter(
    (item) => item.type === "found" && item.status === "active"
  ).length;

  const returnedCount = items.filter(
    (item) => item.status === "returned"
  ).length;

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setNotice("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setForm((previous) => ({ ...previous, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const removeSelectedImage = () => {
    setForm((previous) => ({ ...previous, image: null }));
    setImagePreview("");
  };

  const resetForm = () => {
    setForm({
      ...initialForm,
      date: new Date().toISOString().slice(0, 10),
    });
    setImagePreview("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.location.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("category", form.category);
      formData.append("type", form.type);
      formData.append("location", form.location.trim());
      formData.append("date", form.date);

      if (form.image) {
        formData.append("image", form.image);
      }

      await createItem(formData);

      resetForm();
      setShowForm(false);
      setNotice("Your report was submitted successfully.");
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (itemId, status) => {
    setError("");
    setNotice("");

    try {
      await updateItemStatus(itemId, status);
      setNotice("Item status updated successfully.");
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to update item status.");
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await deleteItem(itemId);
      setNotice("Report deleted successfully.");
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to delete report.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date not provided";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Date not provided";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-logo">R</div>
          <div>
            <h1>ReFound</h1>
            <span>Campus Lost &amp; Found</span>
          </div>
        </div>

        <div className="dashboard-header-actions">
          <span className="welcome-user">
            Welcome, {user?.name || "User"}
          </span>

          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <button
            type="button"
            className="logout-button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">CAMPUS COMMUNITY</p>
            <h2>Find what matters. Return what belongs.</h2>
            <p>
              Report lost belongings, share found items, and help your campus
              community reconnect with their essentials.
            </p>
          </div>

          <button
            type="button"
            className="add-report-button"
            onClick={() => {
              setShowForm((previous) => !previous);
              setError("");
              setNotice("");
            }}
          >
            {showForm ? "Close form" : "+ Create a report"}
          </button>
        </section>

        {error && (
          <div className="dashboard-alert error-alert" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="dashboard-alert success-alert" role="status">
            {notice}
          </div>
        )}

        <section className="dashboard-stats">
          <article className="stat-card">
            <span className="stat-label">Active reports</span>
            <strong>{activeCount}</strong>
            <span className="stat-description">Currently open reports</span>
          </article>

          <article className="stat-card">
            <span className="stat-label">Lost items</span>
            <strong>{lostCount}</strong>
            <span className="stat-description">Items reported missing</span>
          </article>

          <article className="stat-card">
            <span className="stat-label">Found items</span>
            <strong>{foundCount}</strong>
            <span className="stat-description">Items waiting for owners</span>
          </article>

          <article className="stat-card">
            <span className="stat-label">Returned items</span>
            <strong>{returnedCount}</strong>
            <span className="stat-description">Items marked returned</span>
          </article>
        </section>

        {showForm && (
          <section className="report-form-section">
            <div className="section-heading">
              <div>
                <p className="dashboard-eyebrow">NEW REPORT</p>
                <h2>Report an item</h2>
              </div>
            </div>

            <form className="report-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Report type *
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="lost">I lost an item</option>
                    <option value="found">I found an item</option>
                  </select>
                </label>

                <label>
                  Item name *
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="e.g. Black wallet"
                    required
                  />
                </label>

                <label>
                  Category *
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Documents">Documents</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Books">Books</option>
                    <option value="Keys">Keys</option>
                    <option value="Bags">Bags</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label>
                  Location *
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleFormChange}
                    placeholder="Where was it lost or found?"
                    required
                  />
                </label>

                <label>
                  Date *
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleFormChange}
                    required
                  />
                </label>
              </div>

              <label className="form-full-width">
                Description *
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Describe the item and identifying details..."
                  rows="4"
                  required
                />
              </label>

              <div className="image-upload-field">
                <label htmlFor="item-image">Item photo (optional)</label>
                <input
                  id="item-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />
                <small>JPG, PNG, or WEBP. Maximum size: 5 MB.</small>

                {imagePreview && (
                  <div className="image-preview-container">
                    <img
                      src={imagePreview}
                      alt="Selected item preview"
                      className="image-preview"
                    />
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={removeSelectedImage}
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-report-button"
                  disabled={submitting}
                >
                  {submitting ? "Uploading..." : "Submit report"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="reports-section">
          <div className="section-heading">
            <div>
              <p className="dashboard-eyebrow">EXPLORE REPORTS</p>
              <h2>Recent campus reports</h2>
            </div>
            <span className="report-count">
              {filteredItems.length} reports
            </span>
          </div>

          <div className="report-controls">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search items and locations..."
              aria-label="Search reports"
            />

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="report-tabs">
            {[
              ["all", "All reports"],
              ["lost", "Lost items"],
              ["found", "Found items"],
              ["returned", "Returned"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={activeTab === value ? "active" : ""}
                onClick={() => setActiveTab(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="dashboard-empty-state">
              <p>Loading reports...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="dashboard-empty-state">
              <span className="empty-icon">🔎</span>
              <h3>No reports found</h3>
              <p>Try another search or create a new report.</p>
            </div>
          ) : (
            <div className="report-grid">
              {filteredItems.map((item) => (
                <article className="report-card" key={item._id}>
                  {item.image ? (
                    <img
                      className="report-image"
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="report-image-placeholder">
                      {item.type === "lost" ? "🔍" : "📦"}
                    </div>
                  )}

                  <div className="report-card-content">
                    <div className="report-card-top">
                      <span className={`report-type ${item.type}`}>
                        {item.type === "lost" ? "Lost item" : "Found item"}
                      </span>

                      <span className={`report-status ${item.status}`}>
                        {item.status}
                      </span>
                    </div>

                    <h3>{item.title}</h3>
                    <p className="report-description">{item.description}</p>

                    <div className="report-details">
                      <span>📍 {item.location}</span>
                      <span>🏷️ {item.category}</span>
                      <span>📅 {formatDate(item.date)}</span>
                    </div>

                    <div className="report-card-footer">
                      <span>
                        Reported by{" "}
                        {typeof item.reportedBy === "object"
                          ? item.reportedBy?.name || "Campus user"
                          : "Campus user"}
                      </span>
                    </div>

                    {isOwner(item) && (
                      <div className="owner-controls">
                        <label>
                          Update status
                          <select
                            value={item.status || "active"}
                            onChange={(event) =>
                              handleStatusChange(item._id, event.target.value)
                            }
                          >
                            <option value="active">Active</option>
                            <option value="claimed">Claimed</option>
                            <option value="returned">Returned</option>
                          </select>
                        </label>

                        <button
                          type="button"
                          className="delete-report-button"
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete report
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="my-reports-section">
          <div className="section-heading">
            <div>
              <p className="dashboard-eyebrow">YOUR ACTIVITY</p>
              <h2>My reports</h2>
            </div>
            <span className="report-count">
              {myReports.length} reports
            </span>
          </div>

          {myReports.length === 0 ? (
            <p className="my-reports-empty">
              You haven't submitted any reports yet.
            </p>
          ) : (
            <div className="my-reports-list">
              {myReports.map((item) => (
                <div className="my-report-row" key={item._id}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>
                      {item.type} · {formatDate(item.date)}
                    </span>
                  </div>
                  <span className={`report-status ${item.status}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="matches-section">
          <div className="section-heading">
            <div>
              <p className="dashboard-eyebrow">SMART SUGGESTIONS</p>
              <h2>Potential matches</h2>
            </div>
            <span className="report-count">{matches.length} matches</span>
          </div>

          {matches.length === 0 ? (
            <p className="my-reports-empty">
              No potential matches yet. New reports may create a match.
            </p>
          ) : (
            <div className="matches-list">
              {matches.slice(0, 5).map((match, index) => (
                <article
                  className="match-card"
                  key={`${match.lost._id}-${match.found._id}-${index}`}
                >
                  <div>
                    <span className="match-label">Lost report</span>
                    <strong>{match.lost.title}</strong>
                    <span>{match.lost.location}</span>
                  </div>

                  <div className="match-score">
                    <strong>{match.score}%</strong>
                    <span>Match</span>
                  </div>

                  <div>
                    <span className="match-label">Found report</span>
                    <strong>{match.found.title}</strong>
                    <span>{match.found.location}</span>
                  </div>

                  <p>
                    {match.reasons?.join(" · ") || "Possible item match"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-claims-section">
          <Claims items={items} user={user} />
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>
          © {new Date().getFullYear()} ReFound · Campus Lost &amp; Found
        </p>
      </footer>
    </div>
  );
}

export default Dashboard;
