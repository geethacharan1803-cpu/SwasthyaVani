# SwasthyaVani Backend Service (Proposal)

> [!NOTE]
> **Status: Not implemented.**
> The SwasthyaVani application currently runs **100% client-side in the browser** and stores all clinical registries, visit notes, and search indices locally on the device (via static pre-compiled JSON and browser `localStorage`). The offline sync queue in the frontend is simulated. No backend server is required to use the full application today.

---

## 1. Overview and Architecture Intent

When SwasthyaVani is deployed across district-level public health networks, a central synchronization backend will be required to:
1. Ingest queued beneficiary registrations and visit logs recorded by ASHAs in offline field conditions.
2. Resolve synchronization conflicts when multiple health workers or ANMs update the same household record.
3. Distribute updated official clinical protocol releases, seasonal disease outbreak advisories, and updated medication lists down to frontline devices.
4. Integrate with state and national digital health ecosystems (such as Ayushman Bharat Digital Mission - ABDM, and Reproductive Child Health portal - RCH).

The specifications below represent the **proposed API design** for future backend development.

---

## 2. Proposed Architecture Stack

* **Language & Runtime**: Python 3.11+ / FastAPI or Node.js (TypeScript) / Express.
* **Database**: PostgreSQL 16+ with row-level security and PostGIS for rural catchment geofencing.
* **Cache & Rate Limiting**: Redis 7+ for idempotency key tracking and token bucket rate limiting.
* **Object Storage**: S3-compatible or GCS bucket for digitally signed protocol bundle distribution.
* **Authentication**: OAuth2 with short-lived JWTs and device-bound public key attestations (Ed25519).

---

## 3. Proposed REST API Specification

### 3.1 Health and Sync Handshake

#### `GET /api/v1/health`
* **Purpose**: Gateway health check and server time synchronization.
* **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "server_time_utc": "2026-11-05T10:45:00Z",
    "protocol_version": "2026.11-v1"
  }
  ```

#### `GET /api/v1/sync/status`
* **Headers**: `Authorization: Bearer <token>`, `X-Device-Id: <uuid>`
* **Response `200 OK`**:
  ```json
  {
    "asha_id": "ASHA-001",
    "village": "Chandrapuri",
    "last_sync_timestamp": "2026-11-04T08:30:00Z",
    "pending_cloud_updates": 3,
    "active_protocol_bundle": "sha256:4f8a32b9..."
  }
  ```

---

### 3.2 Beneficiary Registration Sync

#### `POST /api/v1/sync/beneficiaries`
* **Purpose**: Ingest beneficiary registrations captured offline.
* **Headers**:
  * `Authorization: Bearer <jwt>`
  * `X-Idempotency-Key: <client-generated-uuid>`
* **Request Payload**:
  ```json
  {
    "batch_id": "BATCH-20261105-001",
    "records": [
      {
        "client_record_id": "TEMP-REG-1730784000",
        "asha_id": "ASHA-001",
        "village": "Chandrapuri",
        "name": "Sunita Devi",
        "age": 24,
        "gender": "F",
        "pregnant": "Y",
        "lmp_date": "2026-07-15",
        "high_risk": true,
        "risk_factors": ["severe_anaemia", "hypertension"],
        "created_at_utc": "2026-11-05T09:15:00Z"
      }
    ]
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "batch_id": "BATCH-20261105-001",
    "status": "processed",
    "ingested_count": 1,
    "conflict_count": 0,
    "receipts": [
      {
        "client_record_id": "TEMP-REG-1730784000",
        "permanent_member_id": "MEM-2026-00428",
        "status": "committed"
      }
    ]
  }
  ```

---

### 3.3 Home Visit Action Logs Sync

#### `POST /api/v1/sync/visits`
* **Purpose**: Ingest visit outcome logs (ANC visits, immunizations, danger sign escalations).
* **Request Payload**:
  ```json
  {
    "batch_id": "VISIT-BATCH-002",
    "actions": [
      {
        "visit_id": "V-20261105-001",
        "member_id": "M-201",
        "asha_id": "ASHA-001",
        "action_type": "anc_checkup",
        "visit_date": "2026-11-05",
        "notes": "BP 138/88 mmHg, IFA tablets distributed (30 tabs)",
        "escalation_triggered": false,
        "logged_at_utc": "2026-11-05T09:45:00Z"
      }
    ]
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "batch_id": "VISIT-BATCH-002",
    "acknowledged_count": 1,
    "rejected_count": 0
  }
  ```

---

## 4. Security, Privacy, and Healthcare Governance

1. **Strict Zero-Knowledge Data Handling**:
   * No direct plaintext storage of Government Identity Numbers (Aadhaar, Voter ID, PAN). If identity linkage is required, it must use irreversible SHA-256 salted hashes.
2. **End-to-End Transport Security**:
   * All network transmissions require mandatory TLS 1.3 with Certificate Pinning enabled on mobile clients.
3. **Storage Encryption**:
   * Database storage volumes must be encrypted at rest with AES-256.
4. **Audit Logging**:
   * Immutable append-only audit trail for all read and write accesses to patient clinical logs.
5. **Conflict Resolution Strategy**:
   * Last-write-wins (LWW) is prohibited for clinical vitals. Field conflicts trigger a manual review flag assigned to the designated Sector Medical Officer or Primary Health Centre (PHC) Medical Officer.
