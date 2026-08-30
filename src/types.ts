export type ChannelType = 'instagram' | 'messenger' | 'whatsapp' | 'telegram' | 'omnichannel';

export type NavigationTab = 'flows' | 'triggers' | 'comment_tools' | 'broadcast' | 'inbox' | 'contacts' | 'analytics' | 'whatsapp_groups' | 'settings';

export type NodeType = 'trigger' | 'message' | 'condition' | 'action' | 'ai_step' | 'delay' | 'ab_split';

export interface FlowButton {
  id: string;
  text: string;
  type: 'flow' | 'url' | 'phone' | 'handover';
  value?: string;
  targetNodeId?: string;
  assignTag?: string; // Tag automatically assigned to contact when this button is clicked
}

export interface QuickReply {
  id: string;
  text: string;
  targetNodeId?: string;
  assignTag?: string; // Tag automatically assigned to contact when this quick reply is clicked
}

export interface CarouselCard {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttons: FlowButton[];
}

export interface ABVariantStats {
  runs: number;
  opens: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
}

export interface FlowNodeData {
  text?: string;
  mediaType?: 'text' | 'image' | 'carousel' | 'audio' | 'video';
  mediaUrl?: string;
  buttons?: FlowButton[];
  quickReplies?: QuickReply[];
  carouselCards?: CarouselCard[];
  delaySeconds?: number;
  showTypingIndicator?: boolean;
  
  // Action properties
  actionType?: 'add_tag' | 'remove_tag' | 'set_field' | 'human_handover' | 'notify_admin' | 'send_email';
  tagToAdd?: string;
  tagToRemove?: string;
  fieldToSet?: string;
  fieldValue?: string;
  
  // Condition properties
  conditionKey?: string;
  conditionOperator?: 'equals' | 'contains' | 'exists' | 'not_exists';
  conditionValue?: string;
  
  // Trigger properties
  triggerType?: 'keyword' | 'post_comment' | 'story_reply' | 'story_mention' | 'get_started' | 'default_reply';
  keywords?: string[];
  matchType?: 'contains' | 'exact' | 'starts_with';
  commentPostScope?: 'all_posts' | 'specific_post' | 'next_post';
  commentSpecificPostId?: string;
  commentSpecificPostUrl?: string;
  commentTargetPages?: string[]; // e.g. ['all_pages'] or list of account IDs
  commentTriggerMode?: 'keywords_only' | 'any_comment';
  commentAutoLike?: boolean;
  commentPublicReplies?: string[];
  
  // AI Step properties
  aiPrompt?: string;
  aiTemperature?: number;
  aiFallbackContext?: string;

  // A/B Split Test properties
  splitRatioA?: number; // percentage, e.g., 50
  splitRatioB?: number; // percentage, e.g., 50
  variantAName?: string; // e.g. "Variante A: Cupom de Boas-Vindas Direto"
  variantBName?: string; // e.g. "Variante B: Quiz Interativo de Estilo"
  variantADescription?: string;
  variantBDescription?: string;
  targetNodeIdA?: string;
  targetNodeIdB?: string;
  testGoal?: 'ctr' | 'lead_tag' | 'purchase' | 'response' | 'human_handover';
  testGoalTargetTag?: string;
  isTestActive?: boolean;
  winnerVariant?: 'A' | 'B' | null;
  autoPickWinner?: boolean;
  minSampleSize?: number;
  statsA?: ABVariantStats;
  statsB?: ABVariantStats;
  confidenceLevel?: number; // e.g. 98.4 (%)
  testStartedAt?: string;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  title: string;
  data: FlowNodeData;
  position: { x: number; y: number };
}

export interface FlowConnection {
  fromNodeId: string;
  toNodeId: string;
  handleType?: 'default' | 'button' | 'quick_reply' | 'true' | 'false' | 'variant_a' | 'variant_b';
  sourceHandleId?: string;
  label?: string;
}

export interface Flow {
  id: string;
  title: string;
  description: string;
  channel: ChannelType;
  isActive: boolean;
  nodes: FlowNode[];
  connections: FlowConnection[];
  createdAt: string;
  updatedAt: string;
  stats: {
    runs: number;
    completed: number;
    ctr: number;
  };
}

export interface KeywordTrigger {
  id: string;
  name: string;
  channel: ChannelType;
  keywords: string[];
  matchType: 'contains' | 'exact' | 'starts_with';
  targetFlowId: string;
  isActive: boolean;
  priority: number;
  cooldownMinutes: number;
  stats: {
    triggeredCount: number;
    lastTriggeredAt?: string;
  };
}

export interface ConnectedMetaAccount {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  channel: 'instagram' | 'messenger';
  category: string;
  followersCount: number;
  isConnected: boolean;
  activeAutomationsCount: number;
}

export interface MetaPostItem {
  id: string;
  type: 'reel' | 'carousel' | 'image' | 'video';
  mediaUrl: string;
  caption: string;
  permalink: string;
  publishedAt: string;
  likesCount: number;
  commentsCount: number;
  channel: 'instagram' | 'messenger';
  accountHandle: string;
}

export interface PostCommentGrowthTool {
  id: string;
  title: string;
  channel: 'instagram' | 'messenger' | 'omnichannel';
  postType: 'all_posts' | 'specific_post' | 'next_post'; // 'all_posts' = Todos os Posts & Reels; 'specific_post' = Post Único; 'next_post' = Próxima publicação
  postId?: string;
  postPreviewUrl?: string;
  postCaption?: string;
  targetPages: string[]; // ['all_pages'] or list of ConnectedMetaAccount IDs
  applyToAllPages: boolean; // Fast toggle for all connected pages/profiles
  includeReels: boolean;
  includeFeedPosts: boolean;
  includeLiveComments?: boolean;
  includeMetaAds?: boolean;
  triggerMode: 'keywords_only' | 'any_comment'; // 'keywords_only' = apenas palavras selecionadas; 'any_comment' = qualquer comentário
  triggerKeywords: string[];
  matchAnyKeyword: boolean;
  publicReplyVariations: string[];
  publicReplyDelaySeconds?: number;
  autoLikeComment: boolean;
  targetFlowId: string;
  isActive: boolean;
  stats: {
    commentsChecked: number;
    dmsSent: number;
    conversionRate: number;
  };
}

export interface ContactNote {
  id: string;
  author: string;
  authorAvatar?: string;
  authorRole?: string;
  content: string;
  category?: 'general' | 'sales' | 'support' | 'important' | 'followup';
  createdAt: string;
  isPinned?: boolean;
}

export type ContactActivityType = 
  | 'flow_triggered' 
  | 'node_executed'
  | 'button_clicked' 
  | 'quick_reply_clicked' 
  | 'tag_added' 
  | 'tag_removed' 
  | 'custom_field_updated' 
  | 'human_handover' 
  | 'comment_keyword_triggered'
  | 'story_reply_triggered'
  | 'broadcast_received' 
  | 'status_changed' 
  | 'note_added';

export interface ContactActivityLog {
  id: string;
  type: ContactActivityType;
  title: string;
  description: string;
  timestamp: string;
  actor: 'bot' | 'user' | 'agent' | 'system';
  flowId?: string;
  flowTitle?: string;
  nodeId?: string;
  nodeTitle?: string;
  buttonId?: string;
  buttonText?: string;
  tagName?: string;
  fieldName?: string;
  fieldValue?: string;
  postCaption?: string;
  campaignName?: string;
  icon?: string;
  badgeText?: string;
}

export type LeadScoreTier = 'hot' | 'warm' | 'cold';

export interface LeadScoreItem {
  id: string;
  category: 'engagement' | 'triggers' | 'tags' | 'profile' | 'conversion' | 'custom';
  label: string;
  detail: string;
  points: number;
  icon?: string;
}

export interface LeadScoreBreakdown {
  totalScore: number;
  tier: LeadScoreTier;
  tierLabel: string;
  tierColor: string;
  items: LeadScoreItem[];
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  key: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  description?: string;
  options?: string[];
  defaultValue?: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  channel: 'instagram' | 'messenger';
  email?: string;
  phone?: string;
  tags: string[];
  customFields: Record<string, string>;
  status: 'active' | 'bot_paused' | 'human_assigned' | 'unsubscribed';
  assignedAgent?: string;
  notes?: string;
  internalNotes?: ContactNote[];
  activityLogs?: ContactActivityLog[];
  leadScore?: number;
  manualScoreBonus?: number;
  createdAt: string;
  lastInteractionAt: string;
  totalInteractions: number;
  lifetimeValue?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  channel: 'instagram' | 'messenger';
  text: string;
  timestamp: string;
  mediaType?: 'text' | 'image' | 'carousel';
  mediaUrl?: string;
  buttons?: FlowButton[];
  quickReplies?: QuickReply[];
  carouselCards?: CarouselCard[];
  status?: 'sent' | 'delivered' | 'read';
  flowNodeId?: string;
}

export interface LiveConversation {
  id: string;
  contactId: string;
  contact: Contact;
  channel: 'instagram' | 'messenger';
  messages: ChatMessage[];
  unreadCount: number;
  isBotActive: boolean;
  assignedTo?: string;
  status: 'open' | 'pending_ai' | 'human_takeover' | 'resolved';
  lastMessage: {
    text: string;
    timestamp: string;
    sender: 'user' | 'bot' | 'agent';
  };
}

export interface BotKnowledgeBase {
  companyName: string;
  businessSummary: string;
  productsAndPricing: string;
  shippingAndReturns: string;
  workingHours: string;
  contactWhatsapp: string;
  toneOfVoice: 'friendly' | 'professional' | 'energetic' | 'minimalist';
  enableAIFallback: boolean;
  humanHandoverKeywords: string[];
}

export interface MetaConnectionConfig {
  instagramConnected: boolean;
  instagramHandle: string;
  instagramFollowers: string;
  facebookConnected: boolean;
  facebookPageName: string;
  metaAppId: string;
  webhookStatus: 'active' | 'pending' | 'error';
  tokenExpiresAt: string;
  lastSyncAt: string;
}

export interface SimulatorState {
  isOpen: boolean;
  activeChannel: 'instagram' | 'messenger';
  currentContact: Contact;
  chatHistory: ChatMessage[];
  executionLogs: Array<{
    id: string;
    timestamp: string;
    type: 'trigger' | 'node' | 'action' | 'ai' | 'delay';
    message: string;
  }>;
}

export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled' | 'paused';
export type BroadcastType = 'standard' | 'utility';
export type MetaApprovalStatus = 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' | 'PAUSED';
export type UtilityTemplateCategory = 'UTILITY' | 'AUTHENTICATION' | 'MARKETING';

export interface UtilityTemplateVariable {
  key: string; // e.g. "1", "2" or "first_name", "pedido_id"
  sampleValue: string; // e.g. "Camila", "BR98412899"
  description?: string;
}

export interface UtilityMessageTemplate {
  id: string;
  name: string; // e.g. "confirmacao_envio_pedido"
  displayName: string; // e.g. "Atualização de Envio & Rastreio de Pedido"
  category: UtilityTemplateCategory;
  language: string; // e.g. "pt_BR"
  channel: 'instagram' | 'messenger' | 'omnichannel';
  status: MetaApprovalStatus;
  rejectionReason?: string;
  qualityScore?: 'HIGH' | 'MEDIUM' | 'LOW';
  headerType?: 'none' | 'text' | 'image' | 'document';
  headerContent?: string;
  bodyText: string;
  footerText?: string;
  buttons?: FlowButton[];
  variables: UtilityTemplateVariable[];
  submittedAt?: string;
  approvedAt?: string;
  metaTemplateId?: string;
  usageCount?: number;
}

export interface BroadcastTargetFilter {
  channel: 'all' | 'instagram' | 'messenger';
  tagMode: 'all' | 'any' | 'none';
  tags: string[];
  customFieldKey?: string;
  customFieldOperator?: 'equals' | 'contains' | 'exists' | 'not_exists';
  customFieldValue?: string;
  contactStatus?: 'all' | 'active' | 'bot_paused' | 'human_assigned';
}

export interface BroadcastRecipient {
  contactId: string;
  contactName: string;
  username: string;
  channel: 'instagram' | 'messenger';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  deliveredAt?: string;
  errorMessage?: string;
}

export interface BroadcastCampaign {
  id: string;
  name: string;
  broadcastType?: BroadcastType; // 'standard' or 'utility' (Aquele que precisa aprovar)
  utilityTemplateId?: string; // ID of approved template if utility
  metaApprovalStatus?: MetaApprovalStatus;
  channel: 'instagram' | 'messenger' | 'omnichannel';
  status: BroadcastStatus;
  messageText: string;
  mediaUrl?: string;
  mediaType?: 'text' | 'image' | 'video';
  buttons?: FlowButton[];
  quickReplies?: QuickReply[];
  metaMessageTag?: 'MARKETING_OPT_IN' | 'CONFIRMED_EVENT_UPDATE' | 'POST_PURCHASE_UPDATE' | 'ACCOUNT_UPDATE' | 'HUMAN_AGENT';
  targetFilter: BroadcastTargetFilter;
  scheduledFor?: string; // ISO string or human formatted
  createdAt: string;
  sentAt?: string;
  totalTargeted: number;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  progressPercent: number;
  throttleSpeed?: 'fast' | 'safe' | 'medium'; // e.g. safe = 30 msgs/min (Meta compliance)
  batchConfig?: {
    batchSize: number; // e.g. 50 (Facebook Batch API limit is 50 requests per batch)
    concurrency: number; // e.g. 5 parallel Guzzle workers/promises
    engine: 'guzzle_batch' | 'curl_multi' | 'standard';
    includeGuzzleScript?: boolean;
  };
  recipients?: BroadcastRecipient[];
  variableMappings?: Record<string, string>;
}

export interface MetaBatchRequestItem {
  method: 'POST' | 'GET' | 'DELETE';
  relative_url: string; // e.g. "v21.0/me/messages"
  body?: string; // URL-encoded or JSON-encoded payload string as expected by Facebook Graph API
  name?: string;
  depends_on?: string;
  omit_response_on_success?: boolean;
}

export interface MetaBatchResponseItem {
  code: number; // 200, 400, 403, etc.
  headers: { name: string; value: string }[];
  body: string; // JSON string payload returned by Meta for this specific operation
}

export interface GraphApiRateLimitUsage {
  callCountPercent: number;
  cpuTimePercent: number;
  totalTimePercent: number;
  estimatedTimeToResetSeconds?: number;
  businessUseCaseUsage?: {
    type: string;
    callCount: number;
    totalCputime: number;
    totalTime: number;
    estimatedTimeToResetMinutes: number;
  }[];
}

export interface BatchMessageItem {
  recipientId: string;
  recipientName?: string;
  channel?: 'instagram' | 'messenger';
  text?: string;
  quickReplies?: Array<{ title: string; payload: string }>;
  tag?: 'CONFIRMED_EVENT_UPDATE' | 'POST_PURCHASE_UPDATE' | 'ACCOUNT_UPDATE' | 'HUMAN_AGENT';
  messagingType?: 'MESSAGE_TAG' | 'RESPONSE' | 'UPDATE';
  metadata?: string;
}

export interface BatchChunkResult {
  chunkIndex: number;
  requestCount: number;
  statusCode: number;
  durationMs: number;
  successCount: number;
  failureCount: number;
  rateLimitUsage?: GraphApiRateLimitUsage;
  rawResponse?: MetaBatchResponseItem[];
  errorDetails?: string[];
}

export interface BatchDispatchResult {
  totalMessages: number;
  totalBatches: number;
  batchSize: number; // Max 50 per Facebook Graph specification
  savedHttpCalls: number; // (totalMessages - totalBatches) -> saved connections
  successfulMessages: number;
  failedMessages: number;
  durationMs: number;
  rateLimitUsage: GraphApiRateLimitUsage;
  chunks: BatchChunkResult[];
  timestamp: string;
  curlSnippet?: string;
  guzzlePhpSnippet?: string;
}

export interface GuzzleBatchExecutionResult {
  totalBatches: number;
  totalMessages: number;
  batchSize: number;
  successfulCount: number;
  failedCount: number;
  concurrency: number;
  executionTimeMs: number;
  guzzlePhpSnippet: string;
  batches: {
    batchIndex: number;
    requestCount: number;
    statusCode: number;
    durationMs: number;
    sampleResponse: string;
  }[];
}

export type WebhookEventType = 
  | 'messages' 
  | 'messaging_postbacks' 
  | 'messaging_optins' 
  | 'message_reactions' 
  | 'message_reads' 
  | 'comments' 
  | 'live_comments' 
  | 'story_insights' 
  | 'leadgen';

export interface WebhookEndpointConfig {
  id: string;
  name: string;
  url: string;
  channel: 'instagram' | 'messenger' | 'omnichannel';
  secretToken: string;
  verifyToken: string;
  isActive: boolean;
  events: WebhookEventType[];
  retryOnFailure: boolean;
  maxRetries: number;
  timeoutMs: number;
  headers?: { key: string; value: string }[];
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastDeliveryStatus?: 'success' | 'failed' | 'idle';
  lastDeliveryAt?: string;
  lastStatusCode?: number;
  totalDeliveries: number;
  totalErrors: number;
}

export interface WebhookDeliveryLog {
  id: string;
  endpointId?: string;
  endpointUrl?: string;
  endpointName?: string;
  method?: string;
  channel: 'instagram' | 'messenger' | 'omnichannel' | string;
  event: WebhookEventType | 'ping_test' | string;
  payload: any;
  requestHeaders?: Record<string, string>;
  responseStatus: number;
  responseStatusText?: string;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  durationMs: number;
  timestamp: string;
  success: boolean;
  error?: string;
  retryCount?: number;
}

export interface WebhookSettingsState {
  endpoints: WebhookEndpointConfig[];
  globalVerifyToken: string;
  appSecret: string;
  serverBaseUrl: string;
  enableLogging: boolean;
}

export type WebhookRoutedType = 
  | 'keyword_trigger' 
  | 'comment_growth_tool' 
  | 'story_mention' 
  | 'lead_ad' 
  | 'welcome_flow' 
  | 'ai_agent_fallback' 
  | 'button_postback'
  | 'optin_plugin'
  | 'handover_human' 
  | 'unhandled';

export interface WebhookAutomationRouteResult {
  routedType: WebhookRoutedType;
  actionTaken: string;
  matchedTriggerId?: string;
  matchedTriggerName?: string;
  matchedFlowId?: string;
  matchedFlowTitle?: string;
  matchedKeyword?: string;
  contactId?: string;
  contactName?: string;
  responseSent?: string;
  executionStatus: 'success' | 'failed' | 'ignored' | 'skipped_cooldown';
  durationMs: number;
  traceId: string;
  details?: Record<string, any>;
}

export interface MetaWebhookEventLog {
  id: string;
  receivedAt: string;
  object: string;
  channel: 'instagram' | 'messenger' | 'facebook_page' | 'omnichannel';
  eventType: WebhookEventType | 'unknown';
  senderId?: string;
  recipientId?: string;
  messageText?: string;
  signatureVerified: boolean;
  signatureHeader?: string;
  routing: WebhookAutomationRouteResult;
  rawPayload: any;
}

export interface WebhookStatsSummary {
  totalReceived: number;
  totalVerified: number;
  totalAutomated: number;
  avgLatencyMs: number;
  successRatePercent: number;
  byEventType: Record<string, number>;
  byRoutedType: Record<string, number>;
  byChannel: Record<string, number>;
}

export type SystemLogCategory = 
  | 'system' 
  | 'flow' 
  | 'contact' 
  | 'webhook' 
  | 'broadcast' 
  | 'ai' 
  | 'security' 
  | 'database';

export type SystemLogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  category: SystemLogCategory;
  level: SystemLogLevel;
  message: string;
  details?: Record<string, any>;
  source?: string;
  actor?: string;
  durationMs?: number;
}

export interface MongoPoolStats {
  connected: boolean;
  poolSize: number;
  minPoolSize: number;
  maxPoolSize: number;
  activeConnections: number;
  availableConnections: number;
  pendingOperations: number;
  uptimeSeconds: number;
  databaseName: string;
  serverVersion?: string;
  pingLatencyMs?: number;
  lastCheckedAt: string;
}

export interface MongoStatusInfo {
  connected: boolean;
  uriConfigured: boolean;
  dbName: string;
  error?: string | null;
  collections?: string[];
  poolStats?: MongoPoolStats;
}

export type MetaRateLimitHealthStatus = 'optimal' | 'moderate' | 'warning' | 'throttled' | 'cooling_down';

export interface MetaAppUsageMetric {
  callCount: number; // Percentage (0-100) of allowed calls used
  totalCpuTime: number; // Percentage of CPU time used
  totalTime: number; // Percentage of total query time
  estimatedTimeToResetMinutes: number;
}

export interface MetaBusinessUseCaseMetric {
  type: string; // e.g. "pages_messaging", "instagram_messaging", "ads_management"
  callCount: number;
  totalCpuTime: number;
  totalTime: number;
  estimatedTimeToResetMinutes: number;
  tier: string;
  windowSizeMinutes: number;
}

export interface MetaHourlyUsagePoint {
  hour: string; // e.g. "00:00", "01:00", "02:00"
  calls: number;
  maxCapacity: number;
  usagePercent: number;
  throttledCalls: number;
  savedByBatch: number;
}

export interface MetaEndpointUsageBreakdown {
  endpoint: string; // e.g. "v21.0/me/messages", "v21.0/oauth/access_token"
  method: 'POST' | 'GET' | 'DELETE';
  totalCalls: number;
  percentOfTotal: number;
  avgLatencyMs: number;
  lastStatusCode: number;
  channel: 'instagram' | 'messenger' | 'graph_system';
}

export interface MetaRateLimitDashboardData {
  healthStatus: MetaRateLimitHealthStatus;
  appUsage: MetaAppUsageMetric;
  businessUseCaseUsage: MetaBusinessUseCaseMetric[];
  hourlyHistory: MetaHourlyUsagePoint[];
  endpointsBreakdown: MetaEndpointUsageBreakdown[];
  policyStatus: {
    messaging24hPolicyCompliant: boolean;
    activeMessageTags: string[];
    allowedBurstRate: number; // calls/second
    activeTier: string; // e.g. "Advanced Access (200 calls/hr/MAU)"
    rollingWindowMinutes: number;
    automaticThrottlingEnabled: boolean;
    adaptiveBackoffEnabled: boolean;
    batchOptimizationActive: boolean;
  };
  liveMetrics: {
    totalCallsToday: number;
    savedCallsViaBatch: number;
    totalSavingsPercent: number;
    lastPingTimestamp: string;
    lastPingDurationMs: number;
    pageId: string;
    appId: string;
    apiVersion: string;
    xAppUsageHeader: string;
    xBusinessUseCaseUsageHeader: string;
  };
  recommendations: {
    id: string;
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
    actionLabel?: string;
  }[];
}

// ============================================================================
// --- AUTHENTICATION, MULTI-TENANT & MULTI-DOMAIN TYPES ---
// ============================================================================

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'agent' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  tenantId: string; // Active workspace / tenant
  allowedTenants: string[]; // Tenants the user can switch between
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantBranding {
  brandName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string; // e.g. "#0084FF"
  accentColor?: string;
  supportEmail?: string;
  customCss?: string;
  footerText?: string;
}

export interface TenantDomain {
  id: string;
  domain: string; // e.g. "app.agenciadigital.com", "atendimento.minhaempresa.com.br"
  isPrimary: boolean;
  sslStatus: 'active' | 'pending' | 'failed' | 'self_managed';
  dnsStatus: 'verified' | 'unverified' | 'propagating';
  verificationToken: string; // TXT record for domain validation
  targetHost: string; // e.g. "127.0.0.1:3000" or server IP
  cnameRecord: string; // e.g. "app.manyflow.com" or server domain
  createdAt: string;
  lastCheckedAt?: string;
}

export interface Tenant {
  id: string; // e.g. "tenant_main", "tenant_agency_01"
  name: string; // Workspace name, e.g. "ManyFlow Matriz", "Agência Alpha"
  slug: string; // e.g. "manyflow-matriz", "agencia-alpha"
  domains: TenantDomain[];
  branding: TenantBranding;
  ownerId: string;
  maxUsers: number;
  maxFlows: number;
  maxContacts: number;
  plan: 'starter' | 'pro' | 'enterprise' | 'whitelabel';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  tenant: Tenant;
  token: string;
  expiresAt: string;
}

// Production Readiness Checklist & Deployment Config Types
export interface ProductionAuditItem {
  id: string;
  category: 'database' | 'security' | 'server' | 'domains' | 'webhooks' | 'meta_api';
  title: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
  details?: string;
  actionPrompt?: string;
}

export interface ProductionAuditReport {
  overallScore: number; // 0 - 100
  isReadyForProduction: boolean;
  timestamp: string;
  items: ProductionAuditItem[];
  environment: {
    nodeEnv: string;
    port: number;
    mongoDbConnected: boolean;
    geminiConfigured: boolean;
    appUrl: string;
    activeTenantsCount: number;
    activeDomainsCount: number;
  };
}

// WhatsApp Group Administration & Monetization System Types
export type WhatsAppEngineType = 'meta_cloud_api' | 'baileys_unofficial' | 'hybrid';

export interface WhatsAppGroupAutoRules {
  antiLink: boolean;
  antiLinkAction: 'warn' | 'delete_msg' | 'kick_member';
  antiSpam: boolean;
  antiPorn: boolean;
  antiForeignNumbers: boolean; // bloqueia números de fora do Brasil (+55) se ativo
  autoWelcome: boolean;
  welcomeMessage: string;
  autoMuteSchedule: {
    enabled: boolean;
    muteTime: string; // Ex: '22:00'
    unmuteTime: string; // Ex: '08:00'
  };
  autoKickExpiredVip: boolean;
  smartLinkRotation: boolean;
  sendDailyDigest: boolean;
}

export interface WhatsAppGroupPricing {
  price: number; // R$
  currency: 'BRL' | 'USD';
  billingCycle: 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'lifetime';
  checkoutUrl?: string;
  pixKey?: string;
  pixQrCode?: string;
  benefits: string[];
}

export interface WhatsAppGroupStats {
  totalJoined: number;
  totalLeft: number;
  currentMembers: number;
  dailyJoinsHistory: { date: string; count: number; leftCount: number }[];
  messagesCount24h: number;
  activeMembersPercent: number;
  churnRate: number; // %
  revenueTotal: number; // R$
  activeSubscribers: number;
  expiringIn7Days: number;
}

export interface WhatsAppGroup {
  id: string;
  name: string;
  jid: string; // ex: '120363028392819@g.us'
  description: string;
  avatarUrl: string;
  inviteLink: string;
  smartRotatorId?: string;
  category: 'vip_monetized' | 'community' | 'launch_funnel' | 'support' | 'leads';
  status: 'active' | 'full' | 'archived' | 'muted';
  memberCount: number;
  maxMembers: number; // normalmente 1024 no WhatsApp
  isAdmin: boolean;
  isVipMonetized: boolean;
  pricing?: WhatsAppGroupPricing;
  autoManagement: WhatsAppGroupAutoRules;
  stats: WhatsAppGroupStats;
  engine: WhatsAppEngineType; // híbrido: Cloud API para Webhooks + Baileys para Disparo/Adm
  createdAt: string;
  updatedAt: string;
}

export interface GroupSubscriber {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  groupJid: string;
  groupName: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'removed';
  plan: 'Mensal VIP' | 'Trimestral' | 'Anual VIP' | 'Vitalício';
  amountPaid: number;
  paymentMethod: 'pix' | 'credit_card' | 'boleto';
  joinedAt: string;
  expiresAt: string;
  lastPaymentAt: string;
  autoRenew: boolean;
  notes?: string;
}

export interface SmartLinkRotator {
  id: string;
  title: string;
  slug: string; // ex: 'vip-investimentos' -> chat.manyflow.io/vip-investimentos
  description: string;
  targetGroupJids: string[];
  maxMembersPerGroup: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  isActive: boolean;
  redirectMode: 'sequential' | 'balanced' | 'least_filled';
  createdAt: string;
}

export interface GroupBroadcastTask {
  id: string;
  title: string;
  targetGroupJids: string[];
  messageText: string;
  mediaType?: 'text' | 'image' | 'video' | 'audio_ptt';
  mediaUrl?: string;
  mentionAll: boolean; // @todos
  delayMinSeconds: number; // anti-ban delay (ex: 5s)
  delayMaxSeconds: number; // (ex: 15s)
  status: 'scheduled' | 'sending' | 'completed' | 'failed' | 'paused';
  sentCount: number;
  totalCount: number;
  scheduledFor?: string;
  createdAt: string;
}

export interface BaileysQueueItem {
  id: string;
  targetGroupJid: string;
  groupName: string;
  messageType: 'text' | 'image' | 'video' | 'audio_ptt' | 'document' | 'kick_member' | 'mute_chat';
  previewContent: string;
  mentionAll?: boolean;
  antiBanDelaySec: number;
  scheduledAt: string;
  dispatchedAt?: string;
  status: 'queued' | 'sending' | 'delivered' | 'read' | 'retry' | 'failed';
  ackStatus?: 'PENDING' | 'SERVER_ACK' | 'DEVICE_ACK' | 'READ_ACK';
  retryCount: number;
  latencyMs?: number;
  errorReason?: string;
}

export interface BaileysGroupSyncStatus {
  groupJid: string;
  groupName: string;
  category: string;
  connectionState: 'synced' | 'syncing' | 'reconnecting' | 'paused' | 'error';
  memberCount: number;
  role: 'superadmin' | 'admin' | 'member';
  announceOnly: boolean; // only admin can send
  lastSyncTimestamp: string;
  pingMs: number;
  deliveryRatePercent: number;
  queuedMessagesCount: number;
  antiLinkActive: boolean;
  antiSpamActive: boolean;
}

export interface BaileysEventLog {
  id: string;
  timestamp: string;
  event: string;
  level: 'info' | 'warn' | 'error' | 'success';
  details: string;
  groupJid?: string;
}

export interface HybridWhatsAppEngineStatus {
  cloudApi: {
    isConnected: boolean;
    phoneNumberId: string;
    wabaId: string;
    webhookUrl: string;
    verifiedName: string;
    tier: 'TIER_100K' | 'TIER_10K' | 'TIER_UNLIMITED';
    qualityRating: 'GREEN' | 'YELLOW' | 'RED';
  };
  baileys: {
    isConnected: boolean;
    sessionId: string;
    connectedNumber: string;
    pushName: string;
    batteryLevel?: number;
    platform: 'multi-device-baileys-v6.7';
    groupsCount: number;
    lastPing: string;
    qrCodeString?: string;
    socketUptimeSeconds?: number;
    reconnectCount?: number;
    pendingQueueCount?: number;
    heapMemoryMb?: number;
    circuitBreakerOpen?: boolean;
  };
}

export interface TelegramBotConfig {
  botToken: string;
  botUsername: string;
  isConnected: boolean;
  webhookUrl: string;
  allowedUpdates: string[];
  activeChatsCount: number;
}


