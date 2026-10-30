const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiRequest(
  endpoint,
  method = "GET",
  data = null,
  protectedRoute = false
) {
  const token = localStorage.getItem("refoundToken");

  const headers = {};

  if (!(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (protectedRoute && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: data
      ? data instanceof FormData
        ? data
        : JSON.stringify(data)
      : undefined,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong.");
  }

  return result;
}

export function registerUser(userData) {
  return apiRequest("/api/auth/register", "POST", userData);
}

export function loginUser(userData) {
  return apiRequest("/api/auth/login", "POST", userData);
}

export function getItems(filters = {}) {
  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.append(key, value);
  });

  const queryString = query.toString();

  return apiRequest(
    `/api/items${queryString ? `?${queryString}` : ""}`
  );
}

export function getMyReports() {
  return apiRequest("/api/items/my-reports", "GET", null, true);
}

export function createItem(itemData) {
  return apiRequest("/api/items", "POST", itemData, true);
}

export function updateItemStatus(id, status) {
  return apiRequest(
    `/api/items/${id}/status`,
    "PATCH",
    { status },
    true
  );
}

export function deleteItem(id) {
  return apiRequest(`/api/items/${id}`, "DELETE", null, true);
}

export function submitClaim(itemId, message) {
  return apiRequest(
    "/api/claims",
    "POST",
    { itemId, message },
    true
  );
}

export function getMyClaims() {
  return apiRequest("/api/claims/my-claims", "GET", null, true);
}

export function getReceivedClaims() {
  return apiRequest("/api/claims/received", "GET", null, true);
}

export function reviewClaim(claimId, status) {
  return apiRequest(
    `/api/claims/${claimId}/review`,
    "PATCH",
    { status },
    true
  );
}