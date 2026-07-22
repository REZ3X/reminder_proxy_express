# Reminder Proxy (Express) — Backend Proxy for Reminder Chatbot

An Express backend proxy that integrates with **Google Calendar API** to provide CRUD reminder operations, designed to work with **Botika Agentic Platform** chatbot workflows.

*Current used version.*

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [1. Setup Google Calendar API \& Service Account](#1-setup-google-calendar-api--service-account)
- [2. Setup Google Calendar](#2-setup-google-calendar)
- [3. Setup Backend Proxy](#3-setup-backend-proxy)
- [4. Deploy Backend Proxy](#4-deploy-backend-proxy)
- [5. Chatbot Workflow (Platform v3 / Agentic Platform)](#5-chatbot-workflow-platform-v3--agentic-platform)
  - [Chatbot Workflow JSON](#chatbot-workflow-json)
- [Webchat Bot Example](#webchat-bot-example)
- [API Reference](#api-reference)
- [Known Issues](#known-issues)
- [Solved Issues](#solved-issues)
- [Working Bot Footage](#working-bot-footage)

---

## Prerequisites

| # | Requirement | Notes |
|---|-------------|-------|
| 1 | Google Account | Required for Google Cloud Console & Calendar |
| 2 | Google Cloud Console Project | Any existing or new project |
| 3 | GitHub Account | For repository hosting |
| 4 | Vercel Account | Connected to your GitHub Account |
| 5 | Git | Version control |
| 6 | Node.js 22+ | Runtime environment |
| 7 | IDE | Preferably integrated with GitHub |
| 8 | Botika Account | Access to Platform v2 & v3 |
| 9 | Postman *(optional)* | For API testing |

---

## 1. Setup Google Calendar API & Service Account

### 1.1 Enable Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/). Ensure you have an active project — if not, create one.
2. Navigate to **API & Services** → **Enabled APIs & services**.
3. Click **"Enable APIs and services"**.
4. Search for **Google Calendar API** and enable it.

![Enable APIs & Services](public/chatbot/images/APIs.png)

![Google Calendar API](public/chatbot/images/calendar.png)

### 1.2 Create a Service Account

1. In the same project, navigate to **IAM & Admin** → **Service Accounts**.

![IAM & Admin](public/chatbot/images/IAMADMIN.png)

2. Click **"Create Service Account"** and follow the prompts.
3. After creation, click the **three-dot menu (⋮)** on your new service account and select **"Manage keys"**.

![Manage Keys](public/chatbot/images/3dots-managekeys.png)

4. Click **"Add key"** → **"Create new key"** → select **JSON** format.
5. A JSON file will be downloaded automatically. **Save this file securely.**

> [!NOTE]
> The downloaded JSON has the following structure. You will need the `private_key` and `client_email` values later.

```json
{
  "type": "service_account",
  "project_id": "<project-id>",
  "private_key_id": "<key-id>",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "google-calendar@<project-id>.iam.gserviceaccount.com",
  "client_id": "<client-id>",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/...",
  "universe_domain": "googleapis.com"
}
```

---

## 2. Setup Google Calendar

1. Go to [Google Calendar](https://calendar.google.com/).
2. Open **Settings**, then scroll down to **"Settings for my calendars"**. Select your desired calendar.

![Choose Calendar](public/chatbot/images/chooseCalendar.png)

3. Scroll down to the **"Share with specific people or groups"** section.

![Shared With Section](public/chatbot/images/sharedwith.png)

4. Click **"Add people and groups"** and enter the **Service Account email** from your Google Cloud Console (the `client_email` value in the JSON).
5. Set the permission to **"Make changes to events"**.

![Share with Service Account](public/chatbot/images/sharewithserviceaccount.png)

6. Scroll down to the **"Integrate calendar"** section and copy the **Calendar ID**.

> [!TIP]
> If you selected your primary calendar, the Calendar ID is usually your Google email address.

![Calendar ID](public/chatbot/images/calD.png)

---

## 3. Setup Backend Proxy

### 3.1 Download the Necessary Files From This Repository (index.js, .env.example, package.json, package-lock.json)

* [index.js](index.js)
* [.env.example](.env.example)
* [package.json](package.json)
* [package-lock.json](package-lock.json)

### 3.2 Configure Environment Variables

```bash
cp .env.example .env
```

Open the `.env` file and fill in the following variables:

| Variable | Description | Source |
|----------|-------------|--------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service Account email | `client_email` field in the downloaded JSON |
| `GOOGLE_PRIVATE_KEY` | Private key string | `private_key` field in the downloaded JSON |
| `GOOGLE_CALENDAR_ID` | Calendar ID | "Integrate calendar" section in Google Calendar settings |

### 3.3 Install Dependencies

```bash
npm install
```

### 3.4 Test Locally

1. Start the development server:

   ```bash
   npm run dev
   ```

2. The server will be available at `http://localhost:3000`.

3. Use **Postman** (or any API client) to test the endpoints. Refer to the [API Reference](#api-reference) section below for endpoint details, example parameters, and expected responses.

### 3.5 Push to GitHub

Push the code to your own GitHub repository using Git or your IDE's built-in source control.

> [!IMPORTANT]
> Ensure your GitHub account is integrated with your IDE and that Git is installed on your system.

![GitHub Repository](public/chatbot/images/repo.png)

---

## 4. Deploy Backend Proxy

### 4.1 Deploy on Vercel

1. Go to [Vercel](https://vercel.com/) and navigate to your dashboard.
2. Click **"Add new"** → **"Project"**.
3. Import your backend proxy GitHub repository.

![Import Repository](public/chatbot/images/importrepo.png)

4. Under **Environment Variables**, copy the entire content of your `.env` file and paste it into the Vercel environment variable field.
5. Click **Deploy** and wait for the deployment to complete.

### 4.2 Domain Setup

Vercel provides a free domain. Your API endpoints will be available at:

```
https://<your-domain>/api/reminder/<operation>
```

You may also configure a custom domain on Vercel if desired.

![Domain Settings](public/chatbot/images/domain.png)

> [!NOTE]
> Refer to the [API Reference](#api-reference) section for the full list of endpoints, parameters, and response formats.

---

## 5. Chatbot Workflow (Platform v3 / Agentic Platform)

### 5.1 Initial Setup

1. Open and log in to [Botika Platform v3 / Agentic Platform](https://platform.botika.online/gpt).
2. Create a **new blank bot**.

### 5.2 Persona Configuration

1. Go to the **"Persona"** tab.
2. Copy the persona from [`persona.md`](chatbot/persona/persona.md) and paste it into the **Input Description** field.
3. Save the configuration.

### 5.3 Knowledge Base Setup

1. Go to the **"Knowledge Base"** section.
2. Download the knowledge base file: [`reminder-bot-kb.xlsx`](chatbot/knowledge_base/reminder-bot-kb.xlsx)
3. Click the **"+"** button → **"Import Excel File"** and upload the file.
4. Save after the import completes.

### 5.4 Workflow Configuration

![Workflow Overview](public/chatbot/images/v3.png)

#### Chatbot Workflow JSON

```json
{"nodes":[{"id":"r1ar0myld0","type":"agent-assistant","position":{"x":50,"y":45},"properties":{"label":"Grab Context","model":"azure-openai/gpt-4o","tools":[],"bot_id":"{{bot.id}}","description":"Answers questions automatically based on a persona, knowledge base and instructions.","input_to_ai":"{{user.message}}","json_schema":"","output_type":"text","task_for_ai":"You are a data retrieval engine for calendar reminder requests. Extract ONLY the following fields from {{user.message}}. Do not generate any explanation, confirmation, or elaborating text — output structured data only.\n\nFIELDS TO RETRIEVE:\n\n1. date\n   - Extract user's intended date, however phrased (e.g. \"tomorrow\", \"besok\", \"next Monday\", \"14 August 2026\").\n   - Resolve relative expressions using {{date}} as the current date anchor.\n   - Output format: \"yyyy-mm-dd\"\n   - If not mentioned by user, leave null.\n\n2. start_time\n   - Extract the first time mentioned by the user (e.g. \"8 AM\", \"14:00\", \"jam 8 pagi\").\n   - Combine with resolved `date` to form a full timestamp.\n   - Output format: \"yyyy-mm-ddThh:mm:ss\"\n   - Use {{date}} context to resolve timezone offset if not explicitly stated by user.\n   - If not mentioned by user, leave null.\n\n3. end_time\n   - Default: start_time + 15 minutes, UNLESS user explicitly specifies a duration or end time.\n   - Output format: \"yyyy-mm-ddThh:mm:ss\"\n   - If start_time is null, end_time is also null (cannot compute default).\n\n4. summary\n   - Extract what the reminder is about, based on what the user says they want to be reminded of (e.g. \"minum obat\" → \"Minum Obat\", \"call mom\" → \"Call Mom\", \"meeting sama klien\" → \"Meeting Sama Klien\").\n   - Strip filler/intent phrasing (e.g. \"ingetin aku buat...\", \"remind me to...\", \"set a reminder for...\") — keep only the core subject.\n   - Capitalize the first letter of each main word (title case), do not alter the user's language (keep Indonesian as Indonesian, English as English).\n   - If the user gives no discernible subject/topic at all, leave null (do NOT invent one).\n\n5. reference_datetime\n   - Always defaults to {{datetime}}.\n   - This is NOT user-extracted — always populate with {{datetime}} regardless of what user said.\n   - Used only as the anchor for resolving relative date/time expressions in fields 1–3.\n\nRULES:\n- Only extract what is explicitly present or derivable from {{user.message}}. Do not infer, assume, or hallucinate values not present in the message (except end_time default and reference_datetime, which follow fixed default logic above).\n- If date, start_time, end_time, or summary are not provided/derivable from the user's message, return them as null — do not fabricate placeholder values.\n- No natural language response. No greeting. No confirmation message. Output data only.","tool_choice":"none","embed_memory":true,"llm_provider":"azure_openai","advanced_settings":false,"validation_errors":[],"input_to_ai_setting":{"type":"variable","source":"user"},"validation_warnings":[],"embed_knowledge_base":false,"enable_json_structured_output":false,"process_tool_execution_result":false},"next":{"main":[{"type":"continue","target_node":"iw44zl2vty"}]}},{"id":"iw44zl2vty","type":"entity-llm","position":{"x":-113.48817834306391,"y":49.14459037752313},"properties":{"label":"Retrieve Data","model":"botika/llm-medium","description":"","llm_provider":"botika","text_message":"{{node_output}}","entities_schema":[{"name":"date","example":["2007-06-17"],"description":"Date intended by the user to set the reminder/event"},{"name":"start_time","example":["2025-12-29 10:18:47"],"description":"Start time defined by user"},{"name":"end_time","example":["2026-12-29 10:18:47"],"description":"End time defined by user, could be empty or null"},{"name":"reference_datetime","example":["2025-12-29 10:18:47"],"description":"Fixed by datetime"},{"name":"summary","example":[],"description":"Summary described by the user, like goal of the reminder"}],"validation_errors":[],"validation_warnings":[]},"next":{"main":[{"type":"continue","target_node":"jeghdbjd1u"}]}},{"id":"jeghdbjd1u","type":"set-user-var","position":{"x":-252.55826170837634,"y":51.22243298351901},"properties":{"label":"Save Data","variables":[{"var_key":"user_date","data_type":"string","persist":false,"var_value":"{{node_output.date}}"},{"var_key":"start_time","data_type":"string","persist":false,"var_value":"{{node_output.start_time}}"},{"var_key":"end_time","data_type":"string","persist":false,"var_value":"{{node_output.end_time}}"},{"var_key":"reference_datetime","data_type":"string","persist":false,"var_value":"{{node_output.reference_datetime}}"},{"var_key":"summary","data_type":"string","persist":false,"var_value":"{{node_output.summary}}"}],"decription":"","description":""},"next":{"main":[{"type":"continue","target_node":"3kinqih22g"}]}},{"id":"3kinqih22g","type":"http-request","position":{"x":-259.47471168695614,"y":108.69861394033194},"properties":{"url":"https://api.domain/api/reminder/create-reminder","body":{"summary":"{{summary}}","end_time":"{{end_time}}","timeZone":"Asia/Jakarta","start_time":"{{start_time}}"},"label":"Create API","method":"POST","headers":{"Content-Type":"application/json"},"description":"POST","handle_error":true},"next":{"main":[{"type":"continue","target_node":"y1jnucrdjc"}]}},{"id":"e2f8ixfskt","type":"auto-integration","position":{"x":349.85750339602254,"y":724.0163799456838},"properties":{"text":"{{node_output}}","label":"Auto Integration","operation":"send_message","description":"An auto integration node from all integrations.","save_chatlog":true,"source_input":"previous_node_response_formatter_output","save_as_history_message":true},"next":{}},{"id":"mq4rhfrxr2","type":"switch","position":{"x":263.54425806180103,"y":15.90663884362727},"properties":{"label":"Switch","rules":[{"conditions":[{"operator":{"type":"string","operation":"equals","case_sensitive":false},"source_value":"{{node_output}}","compared_value":"usr.reminderCreate"}],"combinator":"and"},{"conditions":[{"operator":{"type":"string","operation":"equals","case_sensitive":false},"source_value":"{{node_output}}","compared_value":"usr.reminderEdit"}],"combinator":"and"},{"conditions":[{"operator":{"type":"string","operation":"equals","case_sensitive":false},"source_value":"{{node_output}}","compared_value":"usr.reminderList"}],"combinator":"and"},{"conditions":[{"operator":{"type":"string","operation":"equals","case_sensitive":false},"source_value":"{{node_output}}","compared_value":"usr.reminderDelete"}],"combinator":"and"},{"combinator":"and","conditions":[{"operator":{"type":"string","operation":"not_equals","case_sensitive":false,"single_value_check":true},"source_value":"{{node_output}}","compared_value":""}]}],"description":"If condition is true, the flow will be switched to the next step.","fallback_target":4},"next":{"0":[{"type":"continue","target_node":"r1ar0myld0"}],"1":[{"type":"continue","target_node":"ywp8150w4w"}],"2":[{"type":"continue","target_node":"p1p21wxdin"}],"3":[{"type":"continue","target_node":"ou3theiz6e"}],"4":[{"type":"continue","target_node":"jkw61ge94j"}]}},{"id":"cmvxnrzjf1","type":"response-formatter","position":{"x":350.21507556425803,"y":617.5298490030639},"properties":{"label":"Global Format","description":"Format the response output.","response_format":{"default":[{"mode":"use_ai","type":"text","is_active":true}]}},"next":{"main":[{"type":"continue","target_node":"e2f8ixfskt"}]}},{"id":"ah3yv26adn","type":"agent-assistant","position":{"x":831.3325025266707,"y":107.35090146539483},"properties":{"label":"Formatting","model":"azure-openai/gpt-4o","tools":[],"bot_id":"{{bot.id}}","description":"Answers questions automatically based on a persona, knowledge base and instructions.","input_to_ai":"{{user.message}}","json_schema":"","output_type":"text","task_for_ai":"You are a response formatter for a calendar reminder chatbot. Take the raw JSON reminder list data from {{node_output}} and convert it into a clean, human-readable message for the user. Do not output JSON, code blocks, or raw field names — output natural conversational text only.\n\nCRITICAL: {{node_output}} contains a \"reminders_list\" field (a JSON-stringified array) and a \"query_mode\" field. You must parse \"reminders_list\" as JSON to get the array of reminder objects. Example of what {{node_output}} looks like:\n{\n  \"reminders_list\": \"[{\\\"id\\\": \\\"abc123\\\", \\\"summary\\\": \\\"Test\\\", \\\"start\\\": \\\"2026-07-22T10:00:00+07:00\\\", \\\"end\\\": \\\"2026-07-22T12:00:00+07:00\\\", \\\"timeZone\\\": \\\"Asia/Jakarta\\\", \\\"status\\\": \\\"confirmed\\\", \\\"created\\\": \\\"2026-07-21T09:15:32.000Z\\\", \\\"updated\\\": \\\"2026-07-21T09:15:32.000Z\\\", \\\"html_link\\\": \\\"...\\\"}]\",\n  \"query_mode\": \"created_time\"\n}\n\nCRITICAL — IGNORE CONVERSATION HISTORY FOR THIS TASK:\n- Use ONLY the reminders present in THIS EXACT {{node_output}} value for this response.\n- Do NOT reference, recall, or include any reminder mentioned earlier in this conversation that is not present in the current {{node_output}}.\n- If a reminder existed in an earlier turn but is missing now (e.g. it was deleted), treat it as gone — do not mention it.\n- Each time this prompt runs, treat {{node_output}} as the complete and only source of truth, fully replacing any memory of previous lists.\n\nCRITICAL — {{node_output}} BEING PRESENT MEANS THE QUERY WAS VALID:\n- By the time you receive {{node_output}}, the user's request has already been successfully understood and searched — your only job is to report what was found, never to question whether the request made sense.\n- An empty \"reminders_list\" array is a completely normal, expected result — it simply means there is nothing in that time period, not that the user's phrasing was unclear or wrong.\n- NEVER respond as if the user needs to rephrase, clarify, or be more specific. NEVER say things like \"aku belum bisa jawab langsung dari pertanyaannya\" or \"coba tulis dengan format...\". That kind of message is never appropriate output for this prompt — your only two outcomes are: (a) list the reminders found, or (b) use the empty-list phrasing in Rule 2 below.\n- Relative/casual time expressions (e.g. \"besok pagi\", \"minggu ini\", \"nanti sore\") are always valid queries. If the array is empty, it just means nothing was scheduled/created/updated in that window — say so plainly and warmly, as in Rule 2.\n\nEACH REMINDER OBJECT HAS: id, summary, start, end, timeZone, status, created, updated, html_link\n\nFORMATTING RULES:\n\n1. Language\n   - Match the language of {{user.message}} (Indonesian or English).\n   - Match the tone/formality of {{user.message}} (formal or casual).\n\n2. Empty list handling\n   - If the parsed array is empty ([]), tell the user — briefly and matter-of-factly, like reporting a normal result, not an error — that no reminders were found for what they asked. Adapt the phrasing to query_mode:\n     - \"event_time\": \"kamu belum punya reminder yang akan datang di waktu itu\" / \"you don't have any upcoming reminders for that time\"\n     - \"created_time\": \"nggak ada reminder yang kamu buat di periode itu\" / \"no reminders were created in that period\"\n     - \"updated_time\": \"nggak ada reminder yang baru-baru ini diubah di periode itu\" / \"no reminders have been recently updated in that period\"\n   - Do not list anything in this case. Do not ask the user to rephrase — the answer \"none found\" is complete on its own.\n\n3. Choosing which timestamp to display — based on query_mode\n   - If query_mode is \"event_time\" (default): show each reminder's \"start\" (and \"end\" if useful) — the SCHEDULED time. This is the normal case.\n   - If query_mode is \"created_time\": show each reminder's \"created\" timestamp instead — i.e. WHEN it was made, not when it's scheduled. You may optionally also mention the scheduled start time as secondary context (e.g. \"dibuat kemarin, untuk besok jam 8 pagi\" / \"created yesterday, for tomorrow at 8 AM\").\n   - If query_mode is \"updated_time\": show each reminder's \"updated\" timestamp instead — i.e. WHEN it was last edited. You may optionally also mention the scheduled start time as secondary context, same pattern as above.\n   - If query_mode is missing/unrecognized, default to \"event_time\" behavior.\n\n4. Date/time formatting\n   - Convert ISO timestamps into a natural, readable format.\n     Example: \"2026-07-21T08:00:00+07:00\" → \"21 Juli 2026, pukul 08:00\" (Indonesian) or \"July 21, 2026 at 8:00 AM\" (English).\n   - If a timestamp falls on today or tomorrow relative to {{reference_datetime}}, say \"hari ini\" / \"besok\" or \"today\" / \"tomorrow\" instead of the full date. Same logic applies to \"kemarin\" / \"yesterday\" if relevant for created/updated timestamps.\n   - Do not show seconds. Do not show timezone abbreviation unless the user asks.\n   - For \"created\"/\"updated\" fields (which come in UTC \"Z\" format), convert to the user's local time context ({{reference_datetime}}'s offset) before displaying — never show raw UTC times to the user.\n\n5. Numbering and structure\n   - List each reminder as a separate, numbered item, in the exact order they appear in the parsed array.\n   - The count of items you list must exactly match the number of items in the parsed array — never more, never fewer.\n   - Each item should show: the reminder's subject (summary) and the relevant timestamp per rule 3 above — nothing more, unless explicitly relevant.\n\n6. The \"id\" field\n   - NEVER display the raw \"id\" value to the user directly — it is an internal reference only.\n   - Do not mention \"id\", \"event id\", or any technical field names in the output.\n\n7. The \"html_link\" field\n   - Do not include the raw link unless the user has asked to see/open the event.\n\n8. Closing\n   - End with a short, natural offer to help further, matching the user's tone. One sentence only.\n\nOUTPUT: Plain conversational text only. No JSON. No markdown code blocks. No field labels.","tool_choice":"none","embed_memory":true,"llm_provider":"azure_openai","advanced_settings":false,"validation_errors":[],"input_to_ai_setting":{"type":"variable","source":"user"},"validation_warnings":[],"embed_knowledge_base":false,"enable_json_structured_output":false,"process_tool_execution_result":false},"next":{"main":[{"type":"continue","target_node":"cmvxnrzjf1"}]}},{"id":"bew5ayj783","type":"http-request","position":{"x":1018.968524959196,"y":30.15096246165742},"properties":{"url":"https://api.domain/api/reminder/list-reminder","body":{"query_mode":"{{query_mode}}","timeMin":"{{time_min}}","timeMax":"{{time_max}}","createdMin":"{{created_min}}","createdMax":"{{created_max}}","updatedMin":"{{updated_min}}","updatedMax":"{{updated_max}}","maxResults":"{{max_results}}","keyword":"{{var_keyword}}"},"label":"List API","method":"POST","headers":{"Content-Type":"application/json"},"description":"POST","handle_error":true},"next":{"main":[{"type":"continue","target_node":"8fy08afvqy"}]}},{"id":"ou3theiz6e","type":"agent-assistant","position":{"x":533.1856231115206,"y":289.6876040808609},"properties":{"label":"Grab Context","model":"azure-openai/gpt-4o","tools":[],"bot_id":"{{bot.id}}","description":"Answers questions automatically based on a persona, knowledge base and instructions.","input_to_ai":"{{user.message}}","json_schema":"","output_type":"text","task_for_ai":"You are a data retrieval engine for calendar reminder deletion requests. Match the user's message to the correct reminder from the provided list, and extract its ID. Do not generate any explanation, confirmation, or elaborating text — output structured data only.\n\nINPUT CONTEXT:\n- User's message: {{user.message}}\n- Available reminders (raw list from the system): {{reminders_list}}\n  Each item has: id, summary, start, end, timeZone, status, created, updated, html_link\n  IMPORTANT: the order of items in this list reflects the exact numbered order the user was shown (item 1 = first in list, item 2 = second in list, and so on).\n- Current date/time anchor: {{datetime}}\n\nTASK:\n- Identify which reminder the user is referring to, using ANY of the following reference types:\n  1. Positional/ordinal reference — e.g. \"nomor 2\", \"yang kedua\", \"reminder ke-3\", \"the second one\", \"number 1\", \"the first reminder\". Use this ONLY to locate WHICH ITEM in the list the user means (by counting position) — never output the position number itself.\n  2. Content reference — matching against \"summary\" text (e.g. \"meeting sama klien\" → \"Meeting Sama Klien\").\n  3. Scheduled date/time reference — matching against \"start\"/\"end\" (e.g. \"yang jam 8 pagi\" → a reminder starting at 08:00, \"yang besok\" → a reminder scheduled tomorrow).\n  4. Creation/edit time reference — matching against \"created\" or \"updated\" (e.g. \"yang aku buat kemarin\" → a reminder whose \"created\" date is yesterday relative to {{datetime}}, \"yang baru aku ubah\" → the reminder with the most recent \"updated\" timestamp). Note: \"created\" and \"updated\" are in UTC — resolve relative date words like \"kemarin\"/\"yesterday\" using {{datetime}} as the local anchor, converting for the UTC offset as needed.\n  5. Combined references — e.g. \"yang kedua yang meeting itu\" combines positional + content, both should point to the same item for a confident match.\n\nCRITICAL OUTPUT RULE — READ CAREFULLY:\n- The \"id\" field in your output must ALWAYS be the exact value of that item's \"id\" property from {{reminders_list}} — a long alphanumeric string (e.g. \"2ksvcdivbo5ueo40ln7t53kai0\").\n- NEVER output a position number (like \"1\", \"2\", \"3\") as the id, even if the user referred to the reminder by its position.\n- The position/ordinal reference is only used internally to FIND the correct item — the actual \"id\" property of THAT item is what gets returned, not the position count.\n\nEXAMPLE 1 (positional):\nGiven this reminders_list:\n[\n  {\"id\": \"g1gguuk0tbpkhqvv83nhmo3g9c\", \"summary\": \"Test\", ...},\n  {\"id\": \"2ksvcdivbo5ueo40ln7t53kai0\", \"summary\": \"Main\", ...}\n]\nUser says: \"hapus reminder nomor 2\"\n→ \"nomor 2\" refers to the 2nd item in the list (position 2)\n→ The 2nd item's actual id field is \"2ksvcdivbo5ueo40ln7t53kai0\"\n→ Correct output: {\"id\": \"2ksvcdivbo5ueo40ln7t53kai0\", \"candidates\": []}\n→ WRONG output (do not do this): {\"id\": \"2\", \"candidates\": []}\n\nEXAMPLE 2 (creation-time reference):\nGiven this reminders_list:\n[{\"id\": \"mc7eqj75sgighalpe9m144pk2k\", \"summary\": \"Ngoding\", \"start\": \"2026-07-23T15:00:00+07:00\", \"created\": \"2026-07-22T03:06:13.000Z\", \"updated\": \"2026-07-22T03:15:43.595Z\", ...}]\nCurrent datetime ({{datetime}}): \"2026-07-22T14:00:00+07:00\"\nUser says: \"hapus reminder yang aku buat hari ini\"\n→ \"created\" (2026-07-22T03:06:13.000Z) converts to 2026-07-22T10:06:13+07:00 local time — matches \"hari ini\" (today)\n→ Correct output: {\"id\": \"mc7eqj75sgighalpe9m144pk2k\", \"candidates\": []}\n\nRULES:\n- If exactly one reminder clearly matches (by any reference type above), return its ACTUAL \"id\" property value (never a position number).\n- If the user's message is ambiguous and could match more than one reminder, return \"id\": null and list the possible matching ACTUAL id values in \"candidates\".\n- If no reminder in the list matches the user's message at all, return \"id\": null and \"candidates\": [].\n- If the user gives a positional reference (e.g. \"nomor 2\") that is out of range for the list (e.g. list only has 1 item but user said \"nomor 3\"), return \"id\": null and \"candidates\": [].\n- Do not fabricate an id that isn't present in {{reminders_list}}.\n- No natural language response. No greeting. No confirmation message. Output data only.\n\nOUTPUT FORMAT (strict JSON):\n{\n  \"id\": \"string\" | null,\n  \"candidates\": [\"string\", ...]\n}","tool_choice":"none","embed_memory":true,"llm_provider":"azure_openai","advanced_settings":false,"validation_errors":[],"input_to_ai_setting":{"type":"variable","source":"user"},"validation_warnings":[],"embed_knowledge_base":true,"enable_json_structured_output":false,"process_tool_execution_result":false},"next":{"main":[{"type":"continue","target_node":"7s52w1xo28"}]}},{"id":"uuyom6994z","type":"http-request","position":{"x":876.7536580604587,"y":360.78396594048024},"properties":{"url":"https://api.domain/api/reminder/delete-reminder","body":{"id":"{{reminder_id}}","candidates":"{{reminder_candidate}}"},"label":"Delete API","method":"POST","headers":{"Content-Type":"application/json"},"description":"POST","handle_error":true},"next":{"main":[{"type":"continue","target_node":"z4chyheq1n"}]}},{"id":"8fy08afvqy","type":"set-user-var","position":{"x":674.8865431276758,"y":110.88707303036655},"properties":{"label":"Store List","variables":[{"var_key":"reminders_list","data_type":"string","persist":true,"var_value":"{{node_output.response_body.reminders}}"}],"decription":"","description":""},"next":{"main":[{"type":"continue","target_node":"ah3yv26adn"}]}},{"id":"p1p21wxdin","type":"agent-assistant","position":{"x":532.0098673759529,"y":24.083807365421478},"properties":{"label":"Grab Context","model":"azure-openai/gpt-4o","tools":[],"bot_id":"{{bot.id}}","description":"Answers questions automatically based on a persona, knowledge base and instructions.","input_to_ai":"{{user.message}}","json_schema":"","output_type":"text","task_for_ai":"You are a data retrieval engine for calendar reminder listing requests. Extract ONLY the following fields from {{user.message}}. Do not generate any explanation, confirmation, or elaborating text — output structured data only.\n\nFIRST — determine query_mode:\n- \"event_time\" (default) — user wants reminders happening/scheduled within a date range. Trigger phrases: \"besok\", \"minggu ini\", \"reminder aku hari ini\", \"upcoming\".\n- \"created_time\" — user wants reminders based on WHEN THEY WERE MADE, regardless of when the reminder itself is scheduled for. Trigger phrases: \"yang aku buat kemarin\", \"reminder yang aku set minggu lalu\", \"what did I create yesterday\", \"reminders I made last week\".\n- \"updated_time\" — user wants reminders based on WHEN THEY WERE LAST EDITED. Trigger phrases: \"yang baru aku ubah\", \"reminder yang aku edit tadi\", \"what did I recently update\", \"the one I just changed\".\n\nFIELDS TO RETRIEVE:\n\n1. query_mode\n   - One of: \"event_time\" | \"created_time\" | \"updated_time\"\n   - Default to \"event_time\" if the message doesn't clearly indicate creation/edit timing.\n\n2. timeMin / timeMax\n   - ONLY populate these if query_mode is \"event_time\".\n   - Extract the start/end of the date range for when the reminder ITSELF occurs, however phrased (e.g. \"besok\", \"minggu ini\", \"sampai akhir bulan\").\n   - Resolve relative expressions using {{date}} as the current date anchor.\n   - DAY-PART QUALIFIERS: if the message also includes a time-of-day word alongside a date reference, narrow the range to that part of the day instead of the full day. Apply these default windows (24h, same date as resolved from the date reference):\n     - \"dini hari\" / \"tengah malam\" / \"subuh\" → 00:00:00 to 05:59:59\n     - \"pagi\" / \"morning\" → 05:00:00 to 10:59:59\n     - \"siang\" / \"midday\" / \"noon\" → 11:00:00 to 14:59:59\n     - \"sore\" / \"afternoon\" → 15:00:00 to 17:59:59\n     - \"malam\" / \"evening\" / \"night\" → 18:00:00 to 23:59:59\n     - If the user gives an explicit hour or a more specific qualifier (e.g. \"besok pagi jam 9\", \"besok pagi-pagi sekali\"), let the explicit detail override the default window boundaries — narrow further, don't widen past the day-part's own range.\n     - These windows are defaults for ambiguous day-part words, not hard user-stated boundaries — still reason from context if the phrasing implies something different (e.g. \"malam banget\" leaning later).\n   - timeMin format: \"yyyy-mm-ddT00:00:00±hh:mm\" (start of day, or start of day-part window if one applies) — see OFFSET RULE below for the ±hh:mm part.\n   - timeMax format: \"yyyy-mm-ddT23:59:59±hh:mm\" (end of day, or end of day-part window if one applies) — see OFFSET RULE below for the ±hh:mm part.\n   - If query_mode is NOT \"event_time\", leave both null.\n   - If query_mode is \"event_time\" but no period is mentioned at all (no date AND no day-part), leave both null (means \"all upcoming\").\n   - If query_mode is \"event_time\" and ONLY a day-part is mentioned with no date (e.g. \"reminder pagi ini\" implies today — resolve the date from context/{{date}} rather than leaving timeMin/timeMax null).\n\n3. createdMin / createdMax\n   - ONLY populate these if query_mode is \"created_time\".\n   - Extract the date range for WHEN THE REMINDER WAS CREATED, however phrased (e.g. \"kemarin\", \"minggu lalu\", \"3 hari yang lalu\").\n   - Apply the same DAY-PART QUALIFIERS logic as in Field 2 if a time-of-day word is present (e.g. \"yang aku buat kemarin sore\").\n   - Resolve relative expressions using {{date}} as anchor.\n   - createdMin format: \"yyyy-mm-ddT00:00:00±hh:mm\" — see OFFSET RULE below for the ±hh:mm part.\n   - createdMax format: \"yyyy-mm-ddT23:59:59±hh:mm\" — see OFFSET RULE below for the ±hh:mm part.\n   - If query_mode is NOT \"created_time\", leave both null.\n   - If query_mode is \"created_time\" but no specific period given (e.g. \"reminder yang pernah aku buat\" / \"everything I've ever created\"), leave both null (means \"all time\").\n\n4. updatedMin / updatedMax\n   - ONLY populate these if query_mode is \"updated_time\".\n   - Same logic and format as createdMin/createdMax, including DAY-PART QUALIFIERS and the OFFSET RULE below, but for WHEN THE REMINDER WAS LAST MODIFIED.\n   - If query_mode is NOT \"updated_time\", leave both null.\n\n5. maxResults\n   - Extract a specific number if the user asks for a limited count (e.g. \"5 pengingat terakhir\", \"top 3\").\n   - Output format: integer\n   - If not mentioned, leave null.\n\n6. keyword\n   - Extract a specific topic/keyword the user wants to filter by, ONLY if explicitly mentioned (e.g. \"reminder yang ada kata meeting\", \"reminders about doctor appointments\" → \"meeting\" / \"doctor appointments\").\n   - If not mentioned, leave null.\n\n7. reference_datetime\n   - Always defaults to {{datetime}}. Not user-extracted.\n\nOFFSET RULE (applies to every timeMin/timeMax/createdMin/createdMax/updatedMin/updatedMax value you output):\n- The ±hh:mm offset must always be the user's actual local timezone offset, derived from {{datetime}}/{{date}} — for Asia/Jakarta this is +07:00.\n- NEVER output \"+00:00\" or \"Z\" as the offset. Those represent UTC, not \"no timezone\" or a generic default — using them shifts the entire query window by several hours and returns the wrong reminders (e.g. a \"pagi\"/morning query would silently return afternoon results).\n- Do not treat \"+00:00\" as a neutral placeholder under any circumstance, even if an example elsewhere shows a generic format. The offset must match the real local timezone every time, with no exceptions.\n- Example: if the user's local time is WIB (+07:00) and they ask about \"besok pagi\", output timeMin as \"2026-07-23T05:00:00+07:00\" and timeMax as \"2026-07-23T10:59:59+07:00\" — NOT \"...+00:00\".\n\nRULES:\n- Only extract what is explicitly present or derivable from {{user.message}}. Do not hallucinate a range that wasn't implied.\n- A message with no time-period reference at all, in ANY mode, means \"no bound\" — leave the relevant min/max fields null. This is valid and common, not an error.\n- A day-part word (\"pagi\", \"siang\", \"sore\", \"malam\", \"dini hari\") is itself a time-period reference — it must narrow the range per the DAY-PART QUALIFIERS rules above, never be dropped in favor of the full day.\n- Every populated min/max field must follow the OFFSET RULE above — double-check the offset before output, not just the date/hour.\n- No natural language response. No greeting. No confirmation message. Output data only.\n\nOUTPUT FORMAT (strict JSON):\n{\n  \"query_mode\": \"event_time\" | \"created_time\" | \"updated_time\",\n  \"timeMin\": \"yyyy-mm-ddThh:mm:ss±hh:mm\" | null,\n  \"timeMax\": \"yyyy-mm-ddThh:mm:ss±hh:mm\" | null,\n  \"createdMin\": \"yyyy-mm-ddThh:mm:ss±hh:mm\" | null,\n  \"createdMax\": \"yyyy-mm-ddThh:mm:ss±hh:mm\" | null,\n  \"updatedMin\": \"yyyy-mm-ddThh:mm:ss±hh:mm\" | null,\n  \"updatedMax\": \"yyyy-mm-ddThh:mm:ss±hh:mm\" | null,\n  \"maxResults\": integer | null,\n  \"keyword\": \"string\" | null,\n  \"reference_datetime\": \"{{datetime}}\"\n}","tool_choice":"none","embed_memory":true,"llm_provider":"azure_openai","advanced_settings":false,"validation_errors":[],"input_to_ai_setting":{"type":"variable","source":"user"},"validation_warnings":[],"embed_knowledge_base":false,"enable_json_structured_output":false,"process_tool_execution_result":false},"next":{"main":[{"type":"continue","target_node":"qw263xu2ic"}]}},{"id":"qw263xu2ic","type":"entity-llm","position":{"x":688.8022334510322,"y":34.24765311899879},"properties":{"label":"Retrieve Params","model":"botika/llm-medium","description":"","llm_provider":"botika","text_message":"{{node_output}}","entities_schema":[{"name":"timeMin","description":"user's minimal time of the period, could be null if no data present","example":["2026-07-20T00:00:00+07:00"]},{"name":"timeMax","description":"user's maximal time of the period, could be null if no data present","example":["2026-07-20T00:00:00+07:00"]},{"name":"maxResults","description":"user's desireable list limit of the reminders","example":["20","10","5"]},{"name":"createdMin","description":"the reminder minimal time of created time","example":["2026-07-21T00:00:00+07:00"]},{"name":"createdMax","description":"the reminder maximal time of created time","example":["2026-07-21T00:00:00+07:00"]},{"name":"updatedMin","description":"the reminder minimal time of updated time","example":["2026-07-21T00:00:00+07:00"]},{"name":"updatedMax","description":"the reminder maximal time of updated time","example":["2026-07-21T00:00:00+07:00"]},{"name":"keyword","description":"","example":[]},{"name":"query_mode","description":"","example":["event_time","created_time","updated_time"]}],"validation_errors":[],"validation_warnings":[]},"next":{"main":[{"type":"continue","target_node":"rwepi2u9zf"}]}},{"id":"rwepi2u9zf","type":"set-user-var","position":{"x":855.4745419438774,"y":37.47694120361743},"properties":{"label":"Store Param.","variables":[{"var_key":"time_min","data_type":"string","persist":false,"var_value":"{{node_output.timeMin}}"},{"var_key":"time_max","data_type":"string","persist":false,"var_value":"{{node_output.timeMax}}"},{"var_key":"max_results","data_type":"string","persist":false,"var_value":"{{node_output.maxResults}}"},{"var_key":"created_min","data_type":"string","persist":false,"var_value":"{{node_output.createdMin}}"},{"var_key":"created_max","data_type":"string","persist":false,"var_value":"{{node_output.createdMax}}"},{"var_key":"updated_min","data_type":"string","persist":false,"var_value":"{{node_output.updatedMin}}"},{"var_key":"updated_max","data_type":"string","persist":false,"var_value":"{{node_output.updatedMax}}"},{"var_key":"var_keyword","data_type":"string","persist":false,"var_value":"{{node_output.keyword}}"},{"var_key":"query_mode","data_type":"string","persist":false,"var_value":"{{node_output.query_mode}}"}],"decription":"","description":""},"next":{"main":[{"type":"continue","target_node":"bew5ayj783"}]}},{"id":"7s52w1xo28","type":"entity-llm","position":{"x":700.8325084674026,"y":291.89146902851616},"properties":{"label":"Retrieve Param","model":"botika/llm-medium","description":"","llm_provider":"botika","text_message":"{{node_output}}","entities_schema":[{"name":"id","example":[],"description":"the reminder id"},{"name":"candidate","example":[],"description":""}],"validation_errors":[],"validation_warnings":[]},"next":{"main":[{"type":"continue","target_node":"67s2ojy2vl"}]}},{"id":"67s2ojy2vl","type":"set-user-var","position":{"x":864.3739322981653,"y":292.9498532569742},"properties":{"label":"Store Params","variables":[{"var_key":"reminder_id","data_type":"string","persist":false,"var_value":"{{node_output.id}}"},{"var_key":"reminder_candidate","data_type":"string","persist":false,"var_value":"{{node_output.candidate}}"}],"decription":"","description":""},"next":{"main":[{"type":"continue","target_node":"uuyom6994z"}]}},{"id":"ywp8150w4w","type":"agent-assistant","position":{"x":96.18995870576657,"y":235.2653838192856},"properties":{"label":"Grab Context","model":"azure-openai/gpt-4o","tools":[],"bot_id":"{{bot.id}}","description":"Answers questions automatically based on a persona, knowledge base and instructions.","input_to_ai":"{{user.message}}","json_schema":"","output_type":"text","task_for_ai":"You are a data retrieval engine for calendar reminder edit requests. Match the user's message to the correct reminder from the provided list, extract its ID, and extract any new values the user wants to change. Do not generate any explanation, confirmation, or elaborating text — output structured data only.\n\nINPUT CONTEXT:\n- User's message: {{user.message}}\n- Available reminders (raw list from the system): {{reminders_list}}\n  Each item has: id, summary, start, end, timeZone, status, created, updated, html_link\n  IMPORTANT: the order of items in this list reflects the exact numbered order the user was shown (item 1 = first in list, item 2 = second in list, and so on).\n- Current date/time anchor: {{datetime}}\n\nTASK — Step 1: Identify the target reminder\n- Identify which reminder the user wants to edit, using ANY of the following reference types:\n  1. Positional/ordinal reference — e.g. \"nomor 2\", \"yang kedua\", \"reminder ke-3\", \"the second one\", \"number 1\". Use this ONLY to locate WHICH ITEM in the list the user means (by counting position) — never output the position number itself.\n  2. Content reference — matching against \"summary\" text (e.g. \"meeting sama klien\" → \"Meeting Sama Klien\").\n  3. Scheduled date/time reference — matching against \"start\"/\"end\" (e.g. \"yang jam 8 pagi\" → a reminder starting at 08:00, \"yang besok\" → a reminder scheduled tomorrow).\n  4. Creation/edit time reference — matching against \"created\" or \"updated\" (e.g. \"yang aku buat kemarin\" → a reminder whose \"created\" date is yesterday relative to {{datetime}}, \"yang baru aku ubah\" → the reminder with the most recent \"updated\" timestamp). Note: \"created\" and \"updated\" are in UTC — resolve relative date words like \"kemarin\"/\"yesterday\" using {{datetime}} as the local anchor, converting for the UTC offset as needed.\n  5. Combined references — e.g. \"yang kedua yang meeting itu\" combines positional + content, both should point to the same item for a confident match.\n\nCRITICAL OUTPUT RULE — READ CAREFULLY:\n- The \"id\" field in your output must ALWAYS be the exact value of that item's \"id\" property from {{reminders_list}} — a long alphanumeric string (e.g. \"2ksvcdivbo5ueo40ln7t53kai0\").\n- NEVER output a position number (like \"1\", \"2\", \"3\") as the id, even if the user referred to the reminder by its position.\n- The position/ordinal reference is only used internally to FIND the correct item — the actual \"id\" property of THAT item is what gets returned.\n\nEXAMPLE:\nGiven this reminders_list:\n[\n  {\"id\": \"g1gguuk0tbpkhqvv83nhmo3g9c\", \"summary\": \"Test\", ...},\n  {\"id\": \"2ksvcdivbo5ueo40ln7t53kai0\", \"summary\": \"Main\", ...}\n]\nUser says: \"edit reminder nomor 2, ubah jadi jam 3 sore\"\n→ \"nomor 2\" refers to the 2nd item in the list\n→ The 2nd item's actual id is \"2ksvcdivbo5ueo40ln7t53kai0\"\n→ Correct id output: \"2ksvcdivbo5ueo40ln7t53kai0\"\n→ WRONG output (do not do this): \"2\"\n\nTASK — Step 2: Extract the requested changes\n- new_summary: the new subject/title, only if the user explicitly wants to change what the reminder is about. Otherwise null.\n- new_date: the new date, however phrased (e.g. \"besok\", \"next Monday\"), resolved using {{datetime}} as anchor. Output format: \"yyyy-mm-dd\". Only if user wants to change the SCHEDULED date. Otherwise null. This field is informational/intermediate — the actual date change is delivered via new_start_time/new_end_time per the rules below, so always populate those too whenever new_date is set.\n- new_start_time: the FULL new start timestamp, format \"yyyy-mm-ddThh:mm:ss\". Populate this whenever the user changes EITHER the date OR the time OR both — never leave it null if either changed. Build it as follows:\n   - Date part: the user's new date if given, otherwise the MATCHED reminder's existing start date (from its \"start\" field in {{reminders_list}}).\n   - Time part: the user's new time if given, otherwise the MATCHED reminder's existing start time-of-day (from its \"start\" field in {{reminders_list}}).\n   - Example: matched reminder has start \"2026-07-24T13:00:00+07:00\". User says \"ubah jadi tanggal 24\" (date only, no time) → new_start_time = \"2026-07-24T13:00:00\" (new date + reminder's original time-of-day, kept unchanged).\n   - Example: user says \"ubah jamnya jadi jam 3 sore\" (time only, no date) → new_start_time = original date + \"15:00:00\".\n   - If the user changes neither date nor time, leave new_start_time null.\n- new_end_time: same construction logic as new_start_time, but using the matched reminder's \"end\" field as the fallback source, and only populate if the user's edit affects the end/duration OR if new_start_time changed and the reminder's duration should be preserved (in that case, shift new_end_time by the same delta so the original duration is kept). If the user gives an explicit new end time, use that directly instead.\n\nTIME CONVERSION — MANDATORY, NO EXCEPTIONS:\n- new_start_time and new_end_time must ALWAYS be valid 24-hour \"hh:mm:ss\" combined into the full \"yyyy-mm-ddThh:mm:ss\" format. NEVER output a raw/untranslated phrase like \"jam 1 siang\", \"jam 7 malam\", \"3 sore\", etc. as any part of these fields — always resolve to numeric 24-hour time first.\n- Conversion guide for common Indonesian time phrases:\n  - \"pagi\" (morning): jam 1–11 pagi → 01:00–11:00 (same as stated, AM)\n  - \"siang\" (midday): \"jam 12 siang\" → 12:00; \"jam 1 siang\" / \"jam 2 siang\" → 13:00 / 14:00\n  - \"sore\" (afternoon): \"jam 3 sore\" → 15:00; \"jam 5 sore\" → 17:00\n  - \"malam\" (evening/night): \"jam 7 malam\" → 19:00; \"jam 10 malam\" → 22:00; \"jam 12 malam\" → 00:00 (midnight, next day if relevant)\n  - \"dini hari\" / \"subuh\": jam 1–4 dini hari → 01:00–04:00\n- If the user gives an explicit 24-hour or unambiguous time (e.g. \"jam 14:00\", \"2pm\"), use it directly without needing the phrase conversion above.\n- Before finalizing output, verify new_start_time and new_end_time (if populated) contain ONLY digits, \"-\", \"T\", \":\" — no letters, no spaces, no natural-language words. If any letter/word remains, the conversion was skipped and must be redone.\n\nNOTE: \"created\" and \"updated\" are system-managed timestamps and can never be directly edited by the user — they are only used for IDENTIFYING which reminder to edit (Step 1), never as a target of new_date/new_start_time/new_end_time.\n\nRULES:\n- If exactly one reminder clearly matches, return its ACTUAL \"id\" property value (never a position number). Otherwise return \"id\": null and list possible matches (actual id values) in \"candidates\".\n- If the user gives a positional reference that is out of range for the list (e.g. list only has 1 item but user said \"nomor 3\"), return \"id\": null and \"candidates\": [].\n- Only populate new_summary with what the user explicitly stated — do not infer a new title. new_start_time/new_end_time, however, follow the merge-with-original rules above even when only one part (date or time) was explicitly stated.\n- If the user's message contains no identifiable change at all (just identifies which reminder, without saying what to change), leave all change fields null.\n- Do not fabricate an id that isn't present in {{reminders_list}}.\n- No natural language response. No greeting. No confirmation message. Output data only.\n\nOUTPUT FORMAT (strict JSON):\n{\n  \"id\": \"string\" | null,\n  \"candidates\": [\"string\", ...],\n  \"new_summary\": \"string\" | null,\n  \"new_date\": \"yyyy-mm-dd\" | null,\n  \"new_start_time\": \"yyyy-mm-ddThh:mm:ss\" | null,\n  \"new_end_time\": \"yyyy-mm-ddThh:mm:ss\" | null\n}","tool_choice":"none","embed_memory":true,"llm_provider":"azure_openai","advanced_settings":false,"validation_errors":[],"input_to_ai_setting":{"type":"variable","source":"user"},"validation_warnings":[],"embed_knowledge_base":true,"enable_json_structured_output":false,"process_tool_execution_result":false},"next":{"main":[{"type":"continue","target_node":"gpevfyuxz0"}]}},{"id":"gpevfyuxz0","type":"entity-llm","position":{"x":-64.41226878785659,"y":235.90997620684303},"properties":{"label":"Retrieve Data","model":"botika/llm-medium","description":"","llm_provider":"botika","text_message":"{{node_output}}","entities_schema":[{"name":"new_date","example":["2007-06-17"],"description":"Updated date intended by the user to set the reminder/event"},{"name":"new_start_time","example":["2025-12-29 10:18:47"],"description":"Updated start time defined by user"},{"name":"new_end_time","example":["2026-12-29 10:18:47"],"description":"Updated end time defined by user, could be empty or null"},{"name":"reference_datetime","example":["2025-12-29 10:18:47"],"description":"Fixed by datetime"},{"name":"new_summary","example":[],"description":"Updated summary described by the user, like goal of the reminder"},{"name":"id","example":[],"description":"Reminder ID"},{"name":"candidate","example":[],"description":"reminder candidate"}],"validation_errors":[],"validation_warnings":[]},"next":{"main":[{"type":"continue","target_node":"79ebg7zcjk"}]}},{"id":"79ebg7zcjk","type":"set-user-var","position":{"x":-213.64734704588875,"y":237.98781881283892},"properties":{"label":"Save Data","variables":[{"var_key":"user_date","data_type":"string","persist":false,"var_value":"{{node_output.new_date}}"},{"var_key":"start_time","data_type":"string","persist":false,"var_value":"{{node_output.new_start_time}}"},{"var_key":"end_time","data_type":"string","persist":false,"var_value":"{{node_output.new_end_time}}"},{"var_key":"reference_datetime","data_type":"string","persist":false,"var_value":"{{node_output.reference_datetime}}"},{"var_key":"summary","data_type":"string","persist":false,"var_value":"{{node_output.new_summary}}"},{"var_key":"reminder_id","data_type":"string","persist":false,"var_value":"{{node_output.id}}"},{"var_key":"reminder_candidates","data_type":"string","persist":false,"var_value":"{{node_output.candidate}}"}],"decription":"","description":""},"next":{"main":[{"type":"continue","target_node":"tps6b37z5q"}]}},{"id":"tps6b37z5q","type":"http-request","position":{"x":-214.09516391091964,"y":308.40126599674966},"properties":{"url":"https://api.domain/api/reminder/edit-reminder","body":{"id":"{{reminder_id}}","new_date":"{{date}}","candidates":"{{reminder_candidates}}","new_summary":"{{summary}}","new_end_time":"{{end_time}}","new_start_time":"{{start_time}}"},"label":"Edit API","method":"POST","headers":{"Content-Type":"application/json"},"description":"POST","handle_error":true},"next":{"main":[{"type":"continue","target_node":"w6u6odc7r7"}]}},{"id":"w6u6odc7r7","type":"agent-assistant","position":{"x":-82.56716690192705,"y":310.57062355988313},"properties":{"label":"Response Format","model":"azure-openai/gpt-4o","tools":[],"bot_id":"{{bot.id}}","description":"Answers questions automatically based on a persona, knowledge base and instructions.","input_to_ai":"{{user.message}}","json_schema":"","output_type":"text","task_for_ai":"You are a strict, deterministic response generator. You do NOT have creative freedom. You must follow the exact rule below with no exceptions.\n\nINPUT: {{node_output.status_code}}\n\nRULE (follow exactly, no deviation):\n- IF status_code == 200 → output ONLY the fixed success message below, translated to match the user's language ({{user.message}}). Do not add, remove, or rephrase anything else.\n- IF status_code != 200 → output ONLY the fixed error message below, translated to match the user's language. Do not add, remove, or rephrase anything else.\n\nFIXED SUCCESS MESSAGE:\nIndonesian: \"Reminder telah diedit.\"\nEnglish: \"Reminder has been edited.\"\n\nFIXED ERROR MESSAGE:\nIndonesian: \"Maaf kak, ada kendala. Boleh coba ulangi lagi?\"\nEnglish: \"Sorry, something went wrong. Could you try again?\"\n\nABSOLUTE RESTRICTIONS:\n- Do NOT ask the user to rephrase, reformat, or clarify their original message, regardless of what the original message looked like.\n- Do NOT reference or comment on the user's original phrasing, format, or wording in any way.\n- Do NOT suggest example sentences or templates.\n- Do NOT add explanations, reasoning, apologies beyond the fixed error message, or any extra sentence.\n- Your ONLY job is to check status_code and output ONE of the two fixed messages, translated. Nothing else exists in your task.\n- If you feel the urge to add clarifying guidance, suppress it — that is not your role in this step.\n\nOUTPUT: One sentence only. No greeting, no elaboration, no follow-up question.","tool_choice":"none","embed_memory":true,"llm_provider":"azure_openai","advanced_settings":false,"validation_errors":[],"input_to_ai_setting":{"type":"variable","source":"user"},"validation_warnings":[],"embed_knowledge_base":true,"enable_json_structured_output":false,"process_tool_execution_result":false},"next":{"main":[{"type":"continue","target_node":"cmvxnrzjf1"}]}},{"id":"jkw61ge94j","type":"agent-assistant","position":{"x":521.7113413383775,"y":456.3963728669316},"properties":{"label":"Fallback KB&Persona","model":"azure-openai/gpt-4o","tools":[],"bot_id":"{{bot.id}}","description":"Answers questions automatically based on a persona, knowledge base and instructions.","input_to_ai":"{{user.message}}","json_schema":"","output_type":"text","task_for_ai":"Answer using user's language","tool_choice":"none","embed_memory":true,"llm_provider":"azure_openai","advanced_settings":false,"validation_errors":[],"input_to_ai_setting":{"type":"variable","source":"user"},"validation_warnings":[],"embed_knowledge_base":true,"enable_json_structured_output":false,"process_tool_execution_result":false},"next":{"main":[{"type":"continue","target_node":"cmvxnrzjf1"}]}},{"id":"z4chyheq1n","type":"agent-assistant","position":{"x":712.7981665310945,"y":363.72005454621984},"properties":{"label":"Response Format","model":"azure-openai/gpt-4o","tools":[],"bot_id":"{{bot.id}}","description":"Answers questions automatically based on a persona, knowledge base and instructions.","input_to_ai":"{{user.message}}","json_schema":"","output_type":"text","task_for_ai":"You are a strict, deterministic response generator. You do NOT have creative freedom. You must follow the exact rule below with no exceptions.\n\nINPUT: {{node_output.status_code}}\n\nRULE (follow exactly, no deviation):\n- IF status_code == 200 → output ONLY the fixed success message below, translated to match the user's language ({{user.message}}). Do not add, remove, or rephrase anything else.\n- IF status_code != 200 → output ONLY the fixed error message below, translated to match the user's language. Do not add, remove, or rephrase anything else.\n\nFIXED SUCCESS MESSAGE:\nIndonesian: \"Reminder telah dihapus.\"\nEnglish: \"Reminder has been deleted.\"\n\nFIXED ERROR MESSAGE:\nIndonesian: \"Maaf kak, ada kendala. Boleh coba ulangi lagi?\"\nEnglish: \"Sorry, something went wrong. Could you try again?\"\n\nABSOLUTE RESTRICTIONS:\n- Do NOT ask the user to rephrase, reformat, or clarify their original message, regardless of what the original message looked like.\n- Do NOT reference or comment on the user's original phrasing, format, or wording in any way.\n- Do NOT suggest example sentences or templates.\n- Do NOT add explanations, reasoning, apologies beyond the fixed error message, or any extra sentence.\n- Your ONLY job is to check status_code and output ONE of the two fixed messages, translated. Nothing else exists in your task.\n- If you feel the urge to add clarifying guidance, suppress it — that is not your role in this step.\n\nOUTPUT: One sentence only. No greeting, no elaboration, no follow-up question.","tool_choice":"none","embed_memory":true,"llm_provider":"azure_openai","advanced_settings":false,"validation_errors":[],"input_to_ai_setting":{"type":"variable","source":"user"},"validation_warnings":[],"embed_knowledge_base":true,"enable_json_structured_output":false,"process_tool_execution_result":false},"next":{"main":[{"type":"continue","target_node":"cmvxnrzjf1"}]}},{"id":"y1jnucrdjc","type":"agent-assistant","position":{"x":-111.43138475953748,"y":109.27505920033781},"properties":{"label":"Response Format","model":"botika/llm-medium","tools":[],"bot_id":"{{bot.id}}","description":"Answers questions automatically based on a persona, knowledge base and instructions.","input_to_ai":"{{user.message}}","json_schema":"","output_type":"text","task_for_ai":"You are a strict, deterministic response generator. You do NOT have creative freedom. You must follow the exact rule below with no exceptions.\n\nINPUT: {{node_output.status_code}}\n\nRULE (follow exactly, no deviation):\n- IF status_code == 200 → output ONLY the fixed success message below, translated to match the user's language ({{user.message}}). Do not add, remove, or rephrase anything else.\n- IF status_code != 200 → output ONLY the fixed error message below, translated to match the user's language. Do not add, remove, or rephrase anything else.\n\nFIXED SUCCESS MESSAGE:\nIndonesian: \"Reminder telah dibuat.\"\nEnglish: \"Reminder has been created.\"\n\nFIXED ERROR MESSAGE:\nIndonesian: \"Maaf kak, ada kendala. Boleh coba ulangi lagi?\"\nEnglish: \"Sorry, something went wrong. Could you try again?\"\n\nABSOLUTE RESTRICTIONS:\n- Do NOT ask the user to rephrase, reformat, or clarify their original message, regardless of what the original message looked like.\n- Do NOT reference or comment on the user's original phrasing, format, or wording in any way.\n- Do NOT suggest example sentences or templates.\n- Do NOT add explanations, reasoning, apologies beyond the fixed error message, or any extra sentence.\n- Your ONLY job is to check status_code and output ONE of the two fixed messages, translated. Nothing else exists in your task.\n- If you feel the urge to add clarifying guidance, suppress it — that is not your role in this step.\n\nOUTPUT: One sentence only. No greeting, no elaboration, no follow-up question.","tool_choice":"none","embed_memory":true,"llm_provider":"botika","advanced_settings":false,"validation_errors":[],"input_to_ai_setting":{"type":"variable","source":"user"},"validation_warnings":[],"embed_knowledge_base":false,"enable_json_structured_output":false,"process_tool_execution_result":false},"next":{"main":[{"type":"continue","target_node":"cmvxnrzjf1"}]}},{"id":"14ty2js0j1","type":"entity-llm","position":{"x":328.68693658541184,"y":-167.50948125710406},"properties":{"label":"NLP","description":"Operation","entities_schema":[{"name":"operation","description":"You are a semantic intent classifier for a reminder management application.\nYour task is to understand the user's intention and map it to exactly ONE of the four reminder operations below, based on meaning — not just keyword matching.\n\nMENU OPTIONS (choose exactly one):\n- usr.reminderCreate\n- usr.reminderEdit\n- usr.reminderList\n- usr.reminderDelete\n\nCLASSIFICATION GUIDE:\n\nusr.reminderCreate\n- User wants to add/set up a NEW reminder that doesn't exist yet.\n- Trigger words/phrases (Indonesian): buat, bikin, tambah, set, pasang, ingetin, ingatkan\n- Trigger words/phrases (English): create, add, set, make, remind me, schedule\n- Example: \"buatin reminder besok jam 8\", \"remind me tomorrow at 8\", \"set a reminder for meeting\"\n\nusr.reminderEdit\n- User wants to CHANGE, MOVE, or UPDATE an existing reminder (time, title, or both).\n- Trigger words/phrases (Indonesian): ubah, edit, ganti, geser, pindah, update, perbaiki, reschedule\n- Trigger words/phrases (English): edit, change, update, move, reschedule, modify, fix\n- Example: \"ubah reminder meeting jadi jam 3\", \"change my reminder to 5 PM\", \"reschedule the reminder\"\n\nusr.reminderList\n- User wants to SEE, CHECK, or VIEW their existing reminder(s) — no changes intended.\n- Trigger words/phrases (Indonesian): lihat, liat, cek, tampilkan, tunjukkan, ada apa aja, list\n- Trigger words/phrases (English): show, list, see, view, check, what reminders\n- Example: \"reminder aku apa aja\", \"show me my reminders\", \"cek reminder aku dong\"\n\nusr.reminderDelete\n- User wants to REMOVE or CANCEL an existing reminder.\n- Trigger words/phrases (Indonesian): hapus, batalin, batalkan, buang, cancel\n- Trigger words/phrases (English): delete, remove, cancel, get rid of\n- Example: \"hapus reminder besok\", \"cancel my meeting reminder\", \"delete reminder nomor 2\"\n\nRULES:\n- Base your decision on the user's INTENT and MEANING, not just exact keyword presence — e.g. \"aku nggak butuh reminder itu lagi\" (I don't need that reminder anymore) means usr.reminderDelete even without the word \"hapus\".\n- If the message contains BOTH a reference to an existing reminder AND a request to view it before acting, classify by the FINAL action intended (e.g. \"reminder aku apa aja, terus hapus yang meeting\" → usr.reminderDelete, since deletion is the ultimate intent).\n- If the message is a reply to a previous bot question (e.g. confirming which reminder, or providing missing details like a date/time) and continues an in-progress operation, classify it as the SAME operation type as that in-progress flow, not as a new/different one.\n- Positional or ordinal references (\"nomor 1\", \"yang kedua\") alone, without any other verb, should be classified based on the surrounding context of the conversation, not treated as ambiguous by themselves.\n- Output ONLY the menu name — no explanations, no extra text, no punctuation.\n- Only output \"unknown\" if the message is completely unrelated to reminders (e.g. greetings, small talk, unrelated questions). Do NOT output \"unknown\" just because the phrasing is unusual or informal — try hard to match intent first.\n\nOUTPUT: One of exactly these five values, nothing else:\nusr.reminderCreate\nusr.reminderEdit\nusr.reminderList\nusr.reminderDelete","example":[]}],"model":"azure-openai/gpt-4o","llm_provider":"azure_openai","text_message":"{{node_output}}","validation_warnings":[],"validation_errors":[]},"next":{"main":[{"type":"continue","target_node":"4032bh95ti"}]}},{"id":"4032bh95ti","type":"code","position":{"x":338.68693658541184,"y":-75.07254774663747},"properties":{"label":"Map","description":"","script_code":"var input = \"{{node_output}}\"\r\n\r\nreturn input.operation[0] ?? 'unknown'","output_data_type":"string"},"next":{"main":[{"type":"continue","target_node":"mq4rhfrxr2"}]}}]}
```

### 5.5 Testing & Integration

1. Test your workflow directly using the **"Test Workflow"** feature in the Agentic Platform.
2. *(Optional)* Integrate with **Botika Webchat**:
   - Click the **"+"** button on the Start node and configure your webchat settings.
   - The webchat URL can be found under the **"Integration"** tab → **"Webchat"**.
   - Open the Webchat URL (e.g., `https://chat.botika.online/v3/<id>`) to test your bot.

---

## Webchat Bot Example

You can try out a live example of the reminder bot running on Botika Webchat:

🔗 **[https://chat.botika.online/v3/vfwAFYw](https://chat.botika.online/v3/vfwAFYw)**

---

## API Reference

All endpoints use the **POST** method and accept/return **JSON**.

**Base URL:** `https://<your-domain>/api/reminder/`

---

### `POST /api/reminder/create-reminder`

Creates a new reminder event in Google Calendar.

**Request Body:**

```json
{
  "date": "2026-07-21",
  "start_time": "2026-07-21T08:00:00",
  "end_time": "2026-07-21T08:15:00",
  "summary": "Minum Obat",
  "reference_datetime": "2026-07-20T13:52:59"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_time` | `string` | ✅ | ISO 8601 start datetime |
| `end_time` | `string` | ✅ | ISO 8601 end datetime |
| `summary` | `string` | ❌ | Event title (defaults to `"Reminder"`) |
| `timeZone` | `string` | ❌ | Timezone (defaults to `"Asia/Jakarta"`) |

**Success Response (`200`):**

```json
{
  "success": true,
  "event_id": "abc123xyz",
  "html_link": "https://www.google.com/calendar/event?eid=..."
}
```

**Error Response (`400`):**

```json
{
  "success": false,
  "error": "Missing start_time or end_time"
}
```

---

### `POST /api/reminder/list-reminder`

Lists reminder events from Google Calendar within a time range.

**Request Body:**

```json
{
  "timeMin": "2026-07-20T00:00:00+07:00",
  "timeMax": "2026-07-26T23:59:59+07:00",
  "maxResults": 20
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query_mode` | `string` | ❌ | `"event_time"` (default), `"created_time"`, or `"updated_time"` |
| `timeMin` | `string` | ❌ | ISO 8601 start of range (defaults to current time) |
| `timeMax` | `string` | ❌ | ISO 8601 end of range |
| `createdMin` | `string` | ❌ | Filter by creation time (ISO 8601) |
| `createdMax` | `string` | ❌ | Filter by creation time (ISO 8601) |
| `updatedMin` | `string` | ❌ | Filter by update time (ISO 8601) |
| `updatedMax` | `string` | ❌ | Filter by update time (ISO 8601) |
| `keyword` | `string` | ❌ | Search query keyword |
| `maxResults` | `number` | ❌ | Maximum events to return (defaults to `20`) |

**Success Response (`200`):**

```json
{
  "success": true,
  "count": 2,
  "query_mode": "event_time",
  "reminders": [
    {
      "id": "abc123xyz",
      "summary": "Minum Obat",
      "start": "2026-07-21T08:00:00+07:00",
      "end": "2026-07-21T08:15:00+07:00",
      "timeZone": "Asia/Jakarta",
      "status": "confirmed",
      "created": "2026-07-20T08:00:00.000Z",
      "updated": "2026-07-20T08:00:00.000Z",
      "html_link": "https://www.google.com/calendar/event?eid=..."
    },
    {
      "id": "def456uvw",
      "summary": "Meeting Sama Klien",
      "start": "2026-07-22T10:00:00+07:00",
      "end": "2026-07-22T11:00:00+07:00",
      "timeZone": "Asia/Jakarta",
      "status": "confirmed",
      "created": "2026-07-20T08:00:00.000Z",
      "updated": "2026-07-20T08:00:00.000Z",
      "html_link": "https://www.google.com/calendar/event?eid=..."
    }
  ]
}
```

---

### `POST /api/reminder/edit-reminder`

Edits an existing reminder event in Google Calendar.

**Request Body:**

```json
{
  "id": "def456uvw",
  "candidates": [],
  "new_summary": "Review Project",
  "new_date": "2026-07-23",
  "new_start_time": "2026-07-23T15:00:00",
  "new_end_time": null
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ | Event ID of the reminder to edit |
| `new_summary` | `string` | ❌ | Updated event title |
| `new_start_time` | `string` | ❌ | Updated start datetime |
| `new_end_time` | `string` | ❌ | Updated end datetime |
| `timeZone` | `string` | ❌ | Timezone (defaults to `"Asia/Jakarta"`) |

> [!NOTE]
> At least one of `new_summary`, `new_start_time`, or `new_end_time` must be provided.

**Success Response (`200`):**

```json
{
  "success": true,
  "event_id": "def456uvw",
  "summary": "Review Project",
  "start": {
    "dateTime": "2026-07-23T15:00:00+07:00",
    "timeZone": "Asia/Jakarta"
  },
  "end": {
    "dateTime": "2026-07-23T16:00:00+07:00",
    "timeZone": "Asia/Jakarta"
  },
  "html_link": "https://www.google.com/calendar/event?eid=...",
  "fields_updated": ["summary", "start"]
}
```

**Error Response (`400`):**

```json
{
  "success": false,
  "error": "Missing or invalid reminder id"
}
```

**Error Response (`404`):**

```json
{
  "success": false,
  "error": "Reminder not found"
}
```

---

### `POST /api/reminder/delete-reminder`

Deletes a reminder event from Google Calendar.

**Request Body:**

```json
{
  "id": "def456uvw",
  "candidates": []
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ | Event ID of the reminder to delete |

**Success Response (`200`):**

```json
{
  "success": true,
  "deleted_id": "def456uvw"
}
```

**Error Response (`400`):**

```json
{
  "success": false,
  "error": "Missing or invalid reminder id"
}
```

**Error Response (`404`):**

```json
{
  "success": false,
  "error": "Reminder not found or already deleted"
}
```

---

## Known Issues

- **`reminders_list` variable is persistence-dependent**
  The `reminders_list` variable is only populated/updated when the user goes through the `usr.reminderList` branch (i.e., explicitly lists/shows their reminders). If a user tries to directly edit or delete a reminder without listing it first, `reminders_list` may be stale, empty, or mismatched, causing the `id` matching in the Edit/Delete `Grab Context` steps to fail or resolve to the wrong reminder.

- **No API Key Setup**
  This backend proxy still does not implement any API key or authentication mechanism. All endpoints are publicly accessible once deployed. Authentication will be added in a future update.

---

## Solved Issues

- **LLM non-determinism — instruction-following failure**
  At some point, the `edit-reminder` and `delete-reminder` operations may fail when the AI fails to correctly fetch/extract the target reminder's `id`, even though the intended reminder exists in the list. This stems from inherent LLM non-determinism in the Agent Assistant / Entity LLM steps rather than a backend proxy bug.
  **Solved (22 July 2026):** Resolved by using a different LLM model for the Agent Assistant, specifically OpenAI GPT-4o.

---

## Working Bot Footage

- **Listing Reminder**
![Listing Reminder in Webchat](public/chatbot/images/listc.png)
![Google Calendar View](public/chatbot/images/listg.png)
*More of Listing/Showing*
![Listing Reminder in Webchat](public/chatbot/images/listc2.png)

- **Create Reminder**
![Create Reminder in Webchat](public/chatbot/images/createc.png)
![Google Calendar View](public/chatbot/images/createg.png)

- **Edit Reminder**
![Edit Reminder in Webchat](public/chatbot/images/editc.png)

- **Delete Reminder**
![Delete Reminder in Webchat](public/chatbot/images/deletec.png)
![Google Calendar View](public/chatbot/images/deleteg.png)
