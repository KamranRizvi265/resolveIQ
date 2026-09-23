export const SAMPLE_INCIDENTS = [
  {
    id: "INC-4521",
    title: "Payment Gateway Handshake Timeout",
    system: "ERP Financial Gateway",
    severity: "P1-CRITICAL",
    slaRemaining: "14m",
    timestamp: "2 mins ago",
    status: "Active Alert",
    query: "Payment gateway handshake timeout PI-1234 connection reset by peer",
    topK: 5,
    remediationCmd: "curl -X POST https://finops-gateway.internal/v2/handshake/reset -H 'X-Sec-Auth: $FIN_TOKEN' && kubectl rollout restart deployment/payment-relay -n finance-prod",
    remediationScriptTitle: "Restart Gateway Proxy & Flush Mutual TLS Handshake Buffer",
  },
  {
    id: "INC-2290",
    title: "GL Reconciliation Break & Unposted Journals",
    system: "SAP General Ledger",
    severity: "P2-HIGH",
    slaRemaining: "42m",
    timestamp: "8 mins ago",
    status: "Investigating",
    query: "ERP GL reconciliation break unposted journal balance mismatch INC-2290",
    topK: 4,
    remediationCmd: "python3 /opt/finops/scripts/gl_reconcile_audit.py --batch-id GL-2026-09-Q3 --verify-checksums --dry-run=false",
    remediationScriptTitle: "Execute Automated Ledger Checksum Balance Re-Audit",
  },
  {
    id: "INC-3310",
    title: "CRM Customer Master Sync Lag",
    system: "Kafka Broker & Salesforce Bridge",
    severity: "P3-MEDIUM",
    slaRemaining: "1h 24m",
    timestamp: "19 mins ago",
    status: "Degraded",
    query: "CRM customer sync failure Kafka consumer lag offset commit drop INC-3310",
    topK: 3,
    remediationCmd: "/opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server kafka-prod:9092 --group crm-sync-worker --reset-offsets --to-latest --execute",
    remediationScriptTitle: "Reset Lagging Kafka Consumer Offsets for CRM Pipeline",
  },
  {
    id: "INC-8834",
    title: "OMS Order Stuck in Pending Payment",
    system: "Order Management System",
    severity: "P2-HIGH",
    slaRemaining: "31m",
    timestamp: "27 mins ago",
    status: "Escalated L2",
    query: "OMS order stuck pending payment settlement status timeout webhook retry INC-8834",
    topK: 4,
    remediationCmd: "curl -X POST https://oms.internal/api/v1/orders/reconcile-batch -d '{\"status\":\"PENDING_PAYMENT\",\"auto_commit\":true}' -H 'Content-Type: application/json'",
    remediationScriptTitle: "Trigger Asynchronous OMS Payment Settlement Recovery",
  },
  {
    id: "INC-9901",
    title: "ServiceNow-Jira Sync Bridge Token Expired",
    system: "Enterprise ITSM Integration",
    severity: "P3-MEDIUM",
    slaRemaining: "2h 10m",
    timestamp: "45 mins ago",
    status: "Monitoring",
    query: "ServiceNow Jira bridge incident webhook 401 unauthorized OAuth token expired INC-9901",
    topK: 3,
    remediationCmd: "vault kv get -field=oauth_token secret/itsm/servicenow > /run/secrets/itsm_token && systemctl restart snow-jira-bridge",
    remediationScriptTitle: "Rotate Expired ITSM OAuth Secrets & Restart Bridge Daemon",
  }
];

export const DEMO_RESPONSES = {
  "INC-4521": {
    diagnostic: {
      query: "Payment gateway handshake timeout PI-1234 connection reset by peer",
      mode: "diagnostic",
      source_count: 3,
      answer: `### 1. Probable Root Cause
- **Primary Hypothesis [Source 1]**: Mutual TLS (mTLS) handshake negotiation timeout between the ERP payment dispatch pod and internal gateway \`finops-gateway.internal:8443\`. Certificate chain validation stall combined with connection pool exhaustion under peak transaction volume.
- **Evidence**: Ticket [Source 2] references identical socket error \`ECONNRESET (104)\` on gateway worker cluster after security patch roll-out.

### 2. Similar Patterns
- Recurring error signature: \`SSL_ERROR_SYSCALL in handshake state 0x04\`
- Historical correlate: Similar incident on August 14th resolved via connection pool flush and session cache invalidate.

### 3. Suggested Resolution Checklist
1. Run handshake reset command against internal finance gateway cluster.
2. Flush stale TLS session tickets from Redis gateway cache: \`redis-cli -h cache-prod flushdb\`.
3. Restart the active \`payment-relay\` replica set with rolling restart.
4. Verify HTTP 200 health check response on \`https://finops-gateway.internal/healthz\`.

### 4. Escalation Protocol
- If latency remains > 1200ms after Step 3, immediately escalate to **L3 Network Security & Payment Operations** (On-Call: Tier-1 Ops Bridge).
- Problem Management trigger required if downtime exceeds 15 minutes.

### 5. Confidence Rating
- **High (96.4%)** — Perfect semantic match with Runbook \`erp-payment-timeout-pi1234.pdf\` and historical ticket \`INC-4521\`.`,
      sources: [
        {
          id: 1,
          text: "RUNBOOK: ERP Payment Timeout (PI-1234). If payment gateway throws handshake reset (104), verify mTLS client certificates against internal truststore. Check gateway reverse proxy connections and execute TLS session reset. SLA limit is 30 minutes before automatic failover to secondary banking provider.",
          distance: 0.18,
          relevance_pct: 98.2,
          type: "PDF Runbook",
          ref: "runbooks/erp-payment-timeout-pi1234.pdf"
        },
        {
          id: 2,
          text: "TICKET INC-4521: ERP payment dispatch failed with 'Connection reset by peer' during scheduled batch settlement at 02:00 UTC. Resolution: Cleared Redis TLS session cache and bounced payment-relay workers. Verified 5,200 transactions re-processed cleanly.",
          distance: 0.32,
          relevance_pct: 96.8,
          type: "Incident Ticket",
          ref: "tickets/erp-payment-timeout-inc-4521.json"
        },
        {
          id: 3,
          text: "SNOW-INC0012345: Payment gateway API return status 504 Gateway Timeout. Upstream banking network reported intermittent TCP SYN retransmits. Recommendation: Check egress NAT firewall rules and socket recycling limits.",
          distance: 0.65,
          relevance_pct: 93.5,
          type: "ServiceNow XML",
          ref: "tickets/erp-payment-timeout-snow-inc0012345.xml"
        }
      ]
    },
    knowledge: {
      query: "Payment gateway handshake timeout PI-1234 connection reset by peer",
      mode: "knowledge",
      source_count: 2,
      answer: `### 1. Summary
The issue is an ERP payment dispatch handshake timeout caused by connection pool socket exhaustion and unrefreshed mTLS trust certificates during transaction settlement.

### 2. Recommended Actions
1. Check gateway listener status with: \`curl -vk https://finops-gateway.internal:8443/healthz\`
2. Execute mutual TLS session reset via the management API endpoint [Source 1].
3. Roll restart the payment worker pods to re-initialize client connection pools [Source 2].
4. Run transaction replay script for queued payment records marked \`STATE_INTERRUPTED\`.

### 3. Sources Used
- [Source 1]: Runbook SOP \`erp-payment-timeout-pi1234.pdf\`
- [Source 2]: Historical Ticket Resolution \`INC-4521\`

### 4. Confidence
- **High** — All diagnostic symptoms align directly with verified ITIL standard operating procedures.`,
      sources: [
        {
          id: 1,
          text: "RUNBOOK: ERP Payment Timeout (PI-1234). If payment gateway throws handshake reset (104), verify mTLS client certificates against internal truststore. Check gateway reverse proxy connections and execute TLS session reset. SLA limit is 30 minutes before automatic failover to secondary banking provider.",
          distance: 0.18,
          relevance_pct: 98.2,
          type: "PDF Runbook",
          ref: "runbooks/erp-payment-timeout-pi1234.pdf"
        },
        {
          id: 2,
          text: "TICKET INC-4521: ERP payment dispatch failed with 'Connection reset by peer' during scheduled batch settlement at 02:00 UTC. Resolution: Cleared Redis TLS session cache and bounced payment-relay workers. Verified 5,200 transactions re-processed cleanly.",
          distance: 0.32,
          relevance_pct: 96.8,
          type: "Incident Ticket",
          ref: "tickets/erp-payment-timeout-inc-4521.json"
        }
      ]
    }
  },
  "INC-2290": {
    diagnostic: {
      query: "ERP GL reconciliation break unposted journal balance mismatch INC-2290",
      mode: "diagnostic",
      source_count: 2,
      answer: `### 1. Probable Root Cause
- **Primary Hypothesis [Source 1]**: General Ledger batch reconciliation break caused by floating-point rounding variance in multi-currency settlement or asynchronous journal commit timeout during the midnight closing batch.
- **Evidence**: Runbook [Source 1] indicates unposted journals occur when the debit/credit checksum variance exceeds $0.01 tolerance threshold.

### 2. Similar Patterns
- Journal state tagged as \`ERR_POSTING_LOCK\`.
- Corresponds to month-end high-volume currency conversion batches.

### 3. Suggested Resolution Checklist
1. Query unposted journal entries: \`SELECT * FROM gl_staging WHERE post_status = 'LOCK' AND batch_id = 'GL-2026-09-Q3'\`.
2. Run automated checksum re-audit script to isolate skewed ledger lines.
3. Apply currency conversion re-calculation trigger and commit authorized balancing entries.
4. Mark batch for automatic re-posting into SAP Core Ledger.

### 4. Escalation Protocol
- Escalate to **L2 Finance Operations & Accounting Systems** if variance exceeds $500 or persists after automated re-audit.

### 5. Confidence Rating
- **High (95.1%)** — Supported by explicit reconciliation SOP and ticket INC-2290.`,
      sources: [
        {
          id: 1,
          text: "RUNBOOK: ERP GL Reconciliation Break. For unposted journal discrepancies, inspect staging tables for locked rows. Currency variance exceeding 0.01 must be recalibrated through the gl_reconcile_audit tool before re-opening the posting period.",
          distance: 0.22,
          relevance_pct: 97.8,
          type: "PDF Runbook",
          ref: "runbooks/erp-gl-reconciliation-break.pdf"
        },
        {
          id: 2,
          text: "TICKET INC-2290: GL posting queue blocked due to 12 unbalanced FX journal items. Ran audit script, verified exchange rate feed timestamp, and released posting lock. No permanent discrepancies.",
          distance: 0.38,
          relevance_pct: 96.2,
          type: "Incident Ticket",
          ref: "tickets/erp-gl-reconciliation-inc-2290.json"
        }
      ]
    },
    knowledge: {
      query: "ERP GL reconciliation break unposted journal balance mismatch INC-2290",
      mode: "knowledge",
      source_count: 2,
      answer: `### 1. Summary
Unposted journal discrepancy resulting from currency variance locking GL batch commit.

### 2. Recommended Actions
1. Inspect locked batches in ERP financial ledger.
2. Execute automated reconciliation script to verify debit/credit symmetry.
3. Release posting lock once checksum is validated.

### 3. Sources Used
- [Source 1]: \`erp-gl-reconciliation-break.pdf\`
- [Source 2]: \`erp-gl-reconciliation-inc-2290.json\`

### 4. Confidence
- **High** — Standard ITIL finance reconciliation procedure.`,
      sources: [
        {
          id: 1,
          text: "RUNBOOK: ERP GL Reconciliation Break. Inspect staging tables for locked rows. Recalibrate via gl_reconcile_audit tool.",
          distance: 0.22,
          relevance_pct: 97.8,
          type: "PDF Runbook",
          ref: "runbooks/erp-gl-reconciliation-break.pdf"
        },
        {
          id: 2,
          text: "TICKET INC-2290: GL posting queue blocked due to 12 unbalanced FX journal items. Released posting lock after audit.",
          distance: 0.38,
          relevance_pct: 96.2,
          type: "Incident Ticket",
          ref: "tickets/erp-gl-reconciliation-inc-2290.json"
        }
      ]
    }
  }
};

// Fallback generator for arbitrary queries
export function generateGenericResolution(query, mode, topK) {
  const isDiagnostic = mode === "diagnostic";
  return {
    query,
    mode,
    source_count: Math.min(topK, 3),
    answer: isDiagnostic
      ? `### 1. Probable Root Cause
- **Identified Failure Mode [Source 1]**: Latency spike or timeout in downstream enterprise microservice responding to query: "${query}".
- **Correlated Pattern**: Intermittent TCP resets and thread pool saturation detected across core cluster services.

### 2. Similar Patterns
- Historical incidents display elevated connection retry counters prior to service degradation.
- Runbook procedures recommend cache invalidation and pod pool rolling restarts.

### 3. Suggested Resolution Checklist
1. Verify network latency and TLS handshake connectivity to backend dependencies.
2. Clear stale cache entries and execute circuit breaker reset.
3. Check pod resource allocation (Memory/CPU throttling limits).
4. Perform non-disruptive rolling restart of the affected service replicas.

### 4. Escalation Protocol
- Escalate to **L2 Operations Lead** if error rate exceeds 2% over 5 minutes.
- File Problem Ticket if root cause requires upstream infrastructure intervention.

### 5. Confidence Rating
- **High (94.2%)** — Matched against enterprise ITIL knowledge base runbooks.`
      : `### 1. Summary
System investigation for "${query}" matched standard enterprise operational runbooks with automated remediation recommendations.

### 2. Recommended Actions
1. Review active telemetry metrics and application log streams for error signatures [Source 1].
2. Execute diagnostic health ping against target service endpoints [Source 2].
3. Apply standard ITIL L2 corrective action procedure as outlined in the enterprise runbook.
4. Document incident resolution in ITSM ticketing system.

### 3. Sources Used
- [Source 1]: Enterprise Operational Runbooks (PDF/ITSM)
- [Source 2]: Historical Incident Resolution Repository

### 4. Confidence
- **High** — Standard ITIL runbook alignment.`,
    sources: [
      {
        id: 1,
        text: `Enterprise SOP: Diagnostic procedures for '${query}'. Validate upstream load balancer headers, check thread starvation, and restart worker instances if heartbeat fails.`,
        distance: 0.24,
        relevance_pct: 97.6,
        type: "PDF Runbook",
        ref: "runbooks/enterprise-sop-finance.pdf"
      },
      {
        id: 2,
        text: `ITSM Incident KB: Historical ticket matching keywords in '${query}'. Resolved through connection pool reset and cache re-warm.`,
        distance: 0.41,
        relevance_pct: 95.9,
        type: "Incident Ticket",
        ref: "tickets/itsm-historical-kb.json"
      },
      {
        id: 3,
        text: "ServiceNow Bridge: Automated alerting triggered when service latency exceeds 800ms threshold for 3 consecutive intervals.",
        distance: 0.62,
        relevance_pct: 93.8,
        type: "ServiceNow XML",
        ref: "tickets/servicenow-monitor.xml"
      }
    ].slice(0, topK)
  };
}
