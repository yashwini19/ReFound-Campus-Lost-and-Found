import "./Claims.css";
import { useCallback, useEffect, useState } from "react";

import {
  submitClaim,
  getMyClaims,
  getReceivedClaims,
  reviewClaim,
} from "./services/api.js";

import "./Claims.css";

function Claims({ items = [], user }) {
  const [myClaims, setMyClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [claimMessage, setClaimMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const userId = user?._id || user?.id;

  const loadClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [mine, received] = await Promise.all([
        getMyClaims(),
        getReceivedClaims(),
      ]);

      setMyClaims(
        Array.isArray(mine) ? mine : mine?.claims || []
      );

      setReceivedClaims(
        Array.isArray(received)
          ? received
          : received?.claims || []
      );
    } catch (err) {
      setError(err.message || "Unable to load claims.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const isOwner = (item) => {
    const reporter = item?.reportedBy;

    const ownerId =
      typeof reporter === "object"
        ? reporter?._id || reporter?.id
        : reporter;

    return Boolean(
      userId &&
      ownerId &&
      String(userId) === String(ownerId)
    );
  };

  const claimableItems = items.filter(
    (item) =>
      item.type === "found" &&
      item.status === "active" &&
      !isOwner(item)
  );

  const pendingReceived = receivedClaims.filter(
    (claim) => (claim.status || "pending") === "pending"
  );

  const getItem = (claim) => claim.item || claim.itemId || {};

  const getClaimId = (claim) => claim._id || claim.id;

  const getPersonName = (person) =>
    person?.name || person?.username || person?.email || "Campus member";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!activeItem || claimMessage.trim().length < 5) {
      setError("Please enter at least 5 characters explaining your claim.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setNotice("");

      await submitClaim(activeItem._id, claimMessage.trim());

      setNotice("Your claim request was submitted successfully.");
      setActiveItem(null);
      setClaimMessage("");

      await loadClaims();
    } catch (err) {
      setError(err.message || "Unable to submit your claim.");
    } finally {
      setBusy(false);
    }
  };

  const handleReview = async (claimId, status) => {
    try {
      setBusy(true);
      setError("");
      setNotice("");

      await reviewClaim(claimId, status);

      setNotice(
        status === "approved"
          ? "Claim approved! The item is now marked as claimed."
          : "Claim rejected successfully."
      );

      await loadClaims();
    } catch (err) {
      setError(err.message || "Unable to review this claim.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="claims-section" id="claims">
      <div className="claims-heading">
        <div>
          <span className="claims-eyebrow">ITEM RECOVERY</span>
          <h2>Claims &amp; item recovery</h2>
          <p>
            Request found items and manage claims submitted for your reports.
          </p>
        </div>

        <div className="claims-heading-icon">↗</div>
      </div>

      {notice && (
        <div className="claims-notice" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")}>×</button>
        </div>
      )}

      {error && (
        <div className="claims-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>×</button>
        </div>
      )}

      <div className="claims-summary">
        <div>
          <strong>{myClaims.length}</strong>
          <span>My claims</span>
        </div>

        <div>
          <strong>{pendingReceived.length}</strong>
          <span>Pending requests</span>
        </div>

        <div>
          <strong>{receivedClaims.length}</strong>
          <span>Total received</span>
        </div>
      </div>

      <div className="claims-panel">
        <div className="claims-panel-heading">
          <div>
            <h3>Found items you can claim</h3>
            <p>Explain how you can identify an item that belongs to you.</p>
          </div>
        </div>

        {loading ? (
          <div className="claims-empty">Loading found items...</div>
        ) : claimableItems.length === 0 ? (
          <div className="claims-empty">
            No claimable found items are available right now.
          </div>
        ) : (
          <div className="claimable-grid">
            {claimableItems.map((item) => (
              <article className="claim-card" key={item._id}>
                {item.image && (
                  <img
                    className="claim-item-image"
                    src={item.image}
                    alt={item.title}
                  />
                )}

                <div className="claim-card-top">
                  <strong>{item.title}</strong>
                  <span className="claim-status found-status">Found</span>
                </div>

                <p>{item.description}</p>

                <small>
                  Location: {item.location || "Not provided"}
                </small>

                <button
                  className="claim-primary-button"
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setActiveItem(item);
                    setClaimMessage("");
                    setError("");
                  }}
                >
                  Claim this item
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {activeItem && (
        <form className="claim-submit-form" onSubmit={handleSubmit}>
          <h3>Claim: {activeItem.title}</h3>

          <p>
            Explain identifying details that can help the reporter verify
            ownership.
          </p>

          <label htmlFor="claim-message">
            Why does this item belong to you?
          </label>

          <textarea
            id="claim-message"
            rows="4"
            minLength={5}
            maxLength={1000}
            value={claimMessage}
            onChange={(event) => setClaimMessage(event.target.value)}
            placeholder="Describe unique details, stickers, marks, or other proof..."
            required
          />

          <div className="claim-form-actions">
            <button
              type="button"
              className="claim-cancel-button"
              onClick={() => setActiveItem(null)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="claim-primary-button"
              disabled={busy}
            >
              {busy ? "Sending..." : "Send claim request"}
            </button>
          </div>
        </form>
      )}

      <div className="claims-columns">
        <div className="claims-panel">
          <h3>My submitted claims</h3>

          {loading ? (
            <p className="claims-empty">Loading claims...</p>
          ) : myClaims.length === 0 ? (
            <p className="claims-empty">
              You haven't submitted any claims.
            </p>
          ) : (
            myClaims.map((claim) => {
              const item = getItem(claim);

              return (
                <article className="claim-card" key={getClaimId(claim)}>
                  <div className="claim-card-top">
                    <strong>{item.title || "Reported item"}</strong>

                    <span className={`claim-status ${claim.status || "pending"}`}>
                      {claim.status || "pending"}
                    </span>
                  </div>

                  <p>{claim.message}</p>

                  <small>
                    {item.location || "Location not provided"}
                  </small>
                </article>
              );
            })
          )}
        </div>

        <div className="claims-panel">
          <h3>Claims on my reports</h3>

          {loading ? (
            <p className="claims-empty">Loading requests...</p>
          ) : receivedClaims.length === 0 ? (
            <p className="claims-empty">
              No one has claimed your items yet.
            </p>
          ) : (
            receivedClaims.map((claim) => {
              const item = getItem(claim);
              const claimant = claim.claimedBy || {};

              return (
                <article className="claim-card" key={getClaimId(claim)}>
                  <div className="claim-card-top">
                    <strong>{item.title || "Your reported item"}</strong>

                    <span className={`claim-status ${claim.status || "pending"}`}>
                      {claim.status || "pending"}
                    </span>
                  </div>

                  <p>{claim.message}</p>

                  <small>
                    Claimed by: {getPersonName(claimant)}
                  </small>

                  {(claim.status || "pending") === "pending" && (
                    <div className="claim-actions">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleReview(getClaimId(claim), "approved")
                        }
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        className="reject-claim"
                        disabled={busy}
                        onClick={() =>
                          handleReview(getClaimId(claim), "rejected")
                        }
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default Claims;
