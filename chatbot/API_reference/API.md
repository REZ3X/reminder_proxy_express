# Reminder Proxy Express API Reference

This document provides a comprehensive reference of all endpoints exposed by the Reminder Proxy backend, designed to interface with the Google Calendar API.

## Base URL
All API endpoints are prefixed with:
```
/api/reminder
```
When deployed, for example on Vercel, the complete path will be:
```
https://<your-domain>/api/reminder/<operation>
```

---

## Request Preprocessing & Helper Behaviors

The API applies specific input parsing and normalization rules to incoming request parameters:

### 1. Value Unwrapping (`unwrap`)
To accommodate chatbot platforms that may pass variables inside JSON arrays or as stringified arrays, all input values are automatically run through an `unwrap` function.
* **Array Input**: `["value"]` becomes `"value"`.
* **Stringified Array**: `'["value"]'` becomes `"value"`.
* **Null/Undefined**: Resolves to `undefined`.
* **Other values**: Cast to string (`String(value)`).

### 2. Emptiness Check (`isEmpty`)
Values are considered empty if they are `null`, `undefined`, or resolve to any of the following (case-insensitive, trimmed strings):
`""`, `"null"`, `"undefined"`, `"[]"`, `"[""]"`, `"nan"`.

### 3. Timezone Suffix Enforcement (`ensureOffset`)
Certain date-time arguments are automatically checked for a timezone offset:
* If a value has a timezone offset suffix matching `[+-]\d{2}:\d{2}` or `'Z'`, it remains unchanged.
* Otherwise, a default offset (usually `+07:00` for Jakarta/WIB) is appended to the string.
* Empty values are returned as `undefined`.

---

## Standard Data Structure

### The `Reminder` Object
Most CRUD and search operations return reminder events in a unified standard layout:

```json
{
  "id": "string",
  "summary": "string",
  "start": "string (ISO 8601 Timestamp or YYYY-MM-DD Date)",
  "end": "string (ISO 8601 Timestamp or YYYY-MM-DD Date)",
  "timeZone": "string",
  "status": "string",
  "created": "string (ISO 8601 UTC Timestamp)",
  "updated": "string (ISO 8601 UTC Timestamp)",
  "html_link": "string (Google Calendar URL)"
}
```

---

## Endpoints Reference

### 1. Ping Backend Status
Verify if the serverless function proxy is running and reachable.

* **HTTP Method**: `GET`
* **Path**: `/ping`
* **Headers**: `None`
* **Request Body**: `None`

#### Responses

##### Case 1: Successful Connection (HTTP 200)
```json
{
  "message": "Express Serverless Function is running!"
}
```

---

### 2. Create Reminder
Inserts a new event into the Google Calendar.

* **HTTP Method**: `POST`
* **Path**: `/create-reminder`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  | Parameter | Type | Required | Default | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `start_time` | String | **Yes** | | ISO 8601 start timestamp. |
  | `end_time` | String | **Yes** | | ISO 8601 end timestamp. |
  | `summary` | String | No | `"Reminder"` | Summary or title of the reminder. |
  | `timeZone` | String | No | `"Asia/Jakarta"` | Time zone of the calendar event. |

#### Responses

##### Case 1: Success (HTTP 200)
Returns details of the created Google Calendar event.
```json
{
  "success": true,
  "event_id": "google_event_id_12345",
  "summary": "Dentist Appointment",
  "start": {
    "dateTime": "2026-07-28T09:00:00+07:00",
    "timeZone": "Asia/Jakarta"
  },
  "end": {
    "dateTime": "2026-07-28T09:15:00+07:00",
    "timeZone": "Asia/Jakarta"
  },
  "html_link": "https://www.google.com/calendar/event?eid=YWJjMTIz"
}
```

##### Case 2: Validation Failure — Missing Start or End Time (HTTP 400)
Returned when `start_time` or `end_time` is missing or resolves to empty.
```json
{
  "success": false,
  "error": "Missing start_time or end_time"
}
```

##### Case 3: Google API or Runtime Error (HTTP 500)
```json
{
  "success": false,
  "error": "Detailed error message from Google or server environment"
}
```

---

### 3. Edit Reminder (By ID)
Updates an existing reminder using its specific Google Calendar Event ID.

* **HTTP Method**: `POST`
* **Path**: `/edit-reminder`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  | Parameter | Type | Required | Default | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `id` | String | **Yes** | | Google Calendar Event ID. |
  | `new_summary` | String | No | | New title for the reminder. |
  | `new_date` | String | No | | New date string (`YYYY-MM-DD`). |
  | `new_start_clock` | String | No | | New start clock time (`HH:MM:SS`). |
  | `new_end_clock` | String | No | | New end clock time (`HH:MM:SS`). |
  | `timeZone` | String | No | `"Asia/Jakarta"` | Time zone for the updated start and end fields. |

> [!NOTE]
> If any of `new_date`, `new_start_clock`, or `new_end_clock` are supplied, the backend calculates the new event duration:
> * If `new_end_clock` is provided, it sets the exact time.
> * If `new_end_clock` is omitted, it maintains the event's original duration (minimum of 15 minutes).

#### Responses

##### Case 1: Success (HTTP 200)
```json
{
  "success": true,
  "edited": true,
  "event": {
    "id": "google_event_id_12345",
    "summary": "Dentist Appointment (Rescheduled)",
    "start": "2026-07-28T10:00:00+07:00",
    "end": "2026-07-28T10:15:00+07:00",
    "timeZone": "Asia/Jakarta",
    "status": "confirmed",
    "created": "2026-07-27T08:00:00.000Z",
    "updated": "2026-07-27T12:00:00.000Z",
    "html_link": "https://www.google.com/calendar/event?eid=YWJjMTIz"
  },
  "fields_updated": [
    "summary",
    "start",
    "end"
  ]
}
```

##### Case 2: Validation Failure — Missing ID (HTTP 400)
```json
{
  "success": false,
  "error": "Missing or invalid reminder id"
}
```

##### Case 3: Validation Failure — No Fields to Update (HTTP 400)
Returned when the request specifies an ID but provides no new values to change.
```json
{
  "success": false,
  "error": "No changes provided — nothing to update"
}
```

##### Case 4: Reminder Not Found (HTTP 404)
Returned if the event with the provided ID does not exist in Google Calendar.
```json
{
  "success": false,
  "error": "Reminder not found"
}
```

##### Case 5: Google API or Runtime Error (HTTP 500)
```json
{
  "success": false,
  "error": "Detailed error message"
}
```

---

### 4. Search & Edit Reminder
Searches for reminders matching criteria and modifies the matched reminder. This is useful when the exact ID is unknown.

* **HTTP Method**: `POST`
* **Path**: `/search-edit-reminder`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | **Search Fields** | | *(At least one)* | |
  | `search_keyword` | String | No | Case-insensitive substring match against the title. |
  | `search_date` | String | No | Date prefix match on event start (`YYYY-MM-DD`). |
  | `search_start_clock`| String | No | Start clock time match (`HH:MM:SS`). |
  | **Update Fields** | | *(At least one)* | |
  | `new_summary` | String | No | New title for the reminder. |
  | `new_date` | String | No | New date string (`YYYY-MM-DD`). |
  | `new_start_clock` | String | No | New start clock time (`HH:MM:SS`). |
  | `new_end_clock` | String | No | New end clock time (`HH:MM:SS`). |
  | `timeZone` | String | No | Time zone for updates. Defaults to `"Asia/Jakarta"`. |

> [!NOTE]
> The search query scans events from a calculated minimum time up to 365 days in the future.
> * If `search_date` is omitted, search starts from the start of today (upcoming events only).
> * If `search_date` is specified (including past dates), the search window expands to include that date.

#### Responses

##### Case 1: Exactly One Match — Successful Update (HTTP 200)
```json
{
  "success": true,
  "found": true,
  "ambiguous": false,
  "edited": true,
  "event": {
    "id": "google_event_id_12345",
    "summary": "Weekly Team Sync (Updated)",
    "start": "2026-07-28T09:00:00+07:00",
    "end": "2026-07-28T09:30:00+07:00",
    "timeZone": "Asia/Jakarta",
    "status": "confirmed",
    "created": "2026-07-27T08:00:00.000Z",
    "updated": "2026-07-27T12:00:00.000Z",
    "html_link": "https://www.google.com/calendar/event?eid=YWJjMTIz"
  },
  "fields_updated": [
    "summary"
  ]
}
```

##### Case 2: Ambiguous Match — Multiple Reminders Match (HTTP 200)
Returned when more than one reminder matches the search filters. No changes are applied. Returns the candidate events.
```json
{
  "success": true,
  "found": false,
  "ambiguous": true,
  "edited": false,
  "candidates": [
    {
      "id": "event_1",
      "summary": "Meeting with John",
      "start": "2026-07-28T09:00:00+07:00",
      "end": "2026-07-28T09:30:00+07:00",
      "timeZone": "Asia/Jakarta",
      "status": "confirmed",
      "created": "2026-07-27T08:00:00.000Z",
      "updated": "2026-07-27T08:00:00.000Z",
      "html_link": "..."
    },
    {
      "id": "event_2",
      "summary": "Meeting with Sarah",
      "start": "2026-07-28T14:00:00+07:00",
      "end": "2026-07-28T14:30:00+07:00",
      "timeZone": "Asia/Jakarta",
      "status": "confirmed",
      "created": "2026-07-27T08:30:00.000Z",
      "updated": "2026-07-27T08:30:00.000Z",
      "html_link": "..."
    }
  ]
}
```

##### Case 3: No Match Found (HTTP 200)
Returned when no calendar events match the search criteria.
```json
{
  "success": true,
  "found": false,
  "ambiguous": false,
  "edited": false,
  "candidates": []
}
```

##### Case 4: Validation Failure — Missing Search Criteria (HTTP 400)
```json
{
  "success": false,
  "error": "At least one search criterion (search_keyword, search_date, or search_start_clock) is required"
}
```

##### Case 5: Validation Failure — No New Fields to Update (HTTP 400)
```json
{
  "success": false,
  "error": "No changes provided — nothing to update"
}
```

##### Case 6: Google API or Runtime Error (HTTP 500)
```json
{
  "success": false,
  "error": "Detailed error message"
}
```

---

### 5. Delete Reminder (By ID)
Deletes a specific reminder by its Google Calendar Event ID.

* **HTTP Method**: `POST`
* **Path**: `/delete-reminder`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | String | **Yes** | The Google Calendar Event ID of the reminder to delete. |

#### Responses

##### Case 1: Success (HTTP 200)
Deletes the event and returns metadata of the deleted event.
```json
{
  "success": true,
  "deleted_id": "google_event_id_12345",
  "event": {
    "id": "google_event_id_12345",
    "summary": "Dentist Appointment",
    "start": "2026-07-28T09:00:00+07:00",
    "end": "2026-07-28T09:15:00+07:00",
    "timeZone": "Asia/Jakarta",
    "status": "confirmed",
    "created": "2026-07-27T08:00:00.000Z",
    "updated": "2026-07-27T08:00:00.000Z",
    "html_link": "https://www.google.com/calendar/event?eid=YWJjMTIz"
  }
}
```

##### Case 2: Validation Failure — Missing ID (HTTP 400)
```json
{
  "success": false,
  "error": "Missing or invalid reminder id"
}
```

##### Case 3: Reminder Not Found / Already Deleted (HTTP 404)
Returns when the Event ID does not exist or has already been deleted (e.g. Google returns 410 Gone).
```json
{
  "success": false,
  "error": "Reminder not found or already deleted"
}
```

##### Case 4: Google API or Runtime Error (HTTP 500)
```json
{
  "success": false,
  "error": "Detailed error message"
}
```

---

### 6. Search & Delete Reminder
Searches for reminders matching criteria and deletes the matched reminder. This is useful when the exact ID is unknown.

* **HTTP Method**: `POST`
* **Path**: `/search-delete-reminder`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `search_keyword` | String | No | Case-insensitive substring match against the title. |
  | `search_date` | String | No | Date prefix match on event start (`YYYY-MM-DD`). |
  | `search_start_clock`| String | No | Start clock time match (`HH:MM:SS`). |

> [!IMPORTANT]
> At least one search parameter must be provided.

#### Responses

##### Case 1: Exactly One Match — Successful Deletion (HTTP 200)
```json
{
  "success": true,
  "found": true,
  "ambiguous": false,
  "deleted": true,
  "event": {
    "id": "google_event_id_12345",
    "summary": "Dentist Appointment",
    "start": "2026-07-28T09:00:00+07:00",
    "end": "2026-07-28T09:15:00+07:00",
    "timeZone": "Asia/Jakarta",
    "status": "confirmed",
    "created": "2026-07-27T08:00:00.000Z",
    "updated": "2026-07-27T08:00:00.000Z",
    "html_link": "https://www.google.com/calendar/event?eid=YWJjMTIz"
  }
}
```

##### Case 2: Ambiguous Match — Multiple Reminders Match (HTTP 200)
No deletion is performed. Returns the candidate events.
```json
{
  "success": true,
  "found": false,
  "ambiguous": true,
  "deleted": false,
  "candidates": [
    {
      "id": "event_1",
      "summary": "Meeting with Client A",
      "start": "2026-07-28T09:00:00+07:00",
      "end": "2026-07-28T09:30:00+07:00",
      "timeZone": "Asia/Jakarta",
      "status": "confirmed",
      "created": "2026-07-27T08:00:00.000Z",
      "updated": "2026-07-27T08:00:00.000Z",
      "html_link": "..."
    },
    {
      "id": "event_2",
      "summary": "Meeting with Client B",
      "start": "2026-07-28T14:00:00+07:00",
      "end": "2026-07-28T14:30:00+07:00",
      "timeZone": "Asia/Jakarta",
      "status": "confirmed",
      "created": "2026-07-27T08:30:00.000Z",
      "updated": "2026-07-27T08:30:00.000Z",
      "html_link": "..."
    }
  ]
}
```

##### Case 3: No Match Found (HTTP 200)
```json
{
  "success": true,
  "found": false,
  "ambiguous": false,
  "deleted": false,
  "candidates": []
}
```

##### Case 4: Validation Failure — Missing Search Criteria (HTTP 400)
```json
{
  "success": false,
  "error": "At least one search criterion (search_keyword, search_date, or search_start_clock) is required"
}
```

##### Case 5: Google API or Runtime Error (HTTP 500)
```json
{
  "success": false,
  "error": "Detailed error message"
}
```

---

### 7. List Reminders
Queries reminders. Supports three filtering/query modes: by scheduled event time, by when the event was created, or by when the event was last updated.

* **HTTP Method**: `POST`
* **Path**: `/list-reminder`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  | Parameter | Type | Required | Default | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `query_mode` | String | No | `"event_time"` | Mode of query. Choices: `"event_time"`, `"created_time"`, `"updated_time"`. |
  | `timeMin` | String | No | *Start of Today* | Lower bound of event scheduled start time (`ISO 8601`). *(Used only in `event_time` mode)* |
  | `timeMax` | String | No | `"2100-01-01T00:00:00Z"` | Upper bound of event scheduled start time (`ISO 8601`). *(Used only in `event_time` mode)* |
  | `createdMin` | String | No | | Lower bound of event creation time (`ISO 8601`). *(Used only in `created_time` mode)* |
  | `createdMax` | String | No | | Upper bound of event creation time (`ISO 8601`). *(Used only in `created_time` mode)* |
  | `updatedMin` | String | No | | Lower bound of event modification time (`ISO 8601`). *(Used only in `updated_time` mode)* |
  | `updatedMax` | String | No | | Upper bound of event modification time (`ISO 8601`). *(Used only in `updated_time` mode)* |
  | `keyword` | String | No | | Free-text keyword filter (Google API `q` parameter). |
  | `maxResults` | Number \| String | No | `20` | Max number of events to return. |

> [!NOTE]
> Timezone offsets (e.g. `+07:00`) are automatically added to bounds using `ensureOffset` if no offset is present.
> In `"created_time"` and `"updated_time"` modes:
> * Candidates are fetched from Google APIs starting from `2000-01-01T00:00:00Z` or `createdMin`/`updatedMin` using Google Calendar's `updatedMin` query parameter.
> * Filtering is performed locally on the server to match the exact bounds.
> * Results are sorted in descending order of creation or update time before truncation to `maxResults`.

#### Responses

##### Case 1: Success (HTTP 200)
```json
{
  "success": true,
  "count": 1,
  "query_mode": "event_time",
  "reminders": [
    {
      "id": "google_event_id_12345",
      "summary": "Weekly Team Sync",
      "start": "2026-07-28T09:00:00+07:00",
      "end": "2026-07-28T09:30:00+07:00",
      "timeZone": "Asia/Jakarta",
      "status": "confirmed",
      "created": "2026-07-27T08:00:00.000Z",
      "updated": "2026-07-27T08:00:00.000Z",
      "html_link": "https://www.google.com/calendar/event?eid=YWJjMTIz"
    }
  ]
}
```

##### Case 2: Google API or Runtime Error (HTTP 500)
```json
{
  "success": false,
  "error": "Detailed error message"
}
```
