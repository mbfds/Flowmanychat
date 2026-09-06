export type ChannelType = 'instagram' | 'messenger' | 'whatsapp' | 'telegram' | 'sms' | 'omnichannel';

export type NavigationTab = 
  | 'flows' 
  | 'triggers' 
  | 'comment_tools' 
  | 'broadcast' 
  | 'inbox' 
  | 'contacts' 
  | 'appointments' 
  | 'analytics' 
  | 'whatsapp_groups' 
  | 'affiliates' 
  | 'settings' 
  | 'ab_testing'
  | 'admin_users'
  | 'admin_subscriptions'
  | 'admin_packages'
  | 'postiz_planner';

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

export interface MessageVariant {
  id: string; // 'variant_a', 'variant_b', 'variant_c'
  name: string; // 'Variante A (Original)', 'Variante B (Copy Curto & Emoji)'
  text: string;
  mediaType?: 'text' | 'image' | 'carousel' | 'audio' | 'video';
  mediaUrl?: string;
  buttons?: FlowButton[];
  quickReplies?: QuickReply[];
  trafficPercent: number; // e.g. 50
  stats?: ABVariantStats;
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
  actionType?: 'add_tag' | 'remove_tag' | 'set_field' | 'human_handover' | 'notify_admin' | 'send_email' | 'send_sms_httpsms';
  tagToAdd?: string;
  tagToRemove?: string;
  fieldToSet?: string;
  fieldValue?: string;
  smsRecipientPhone?: string;
  smsMessageText?: string;
  smsSimSlot?: 1 | 2;
  
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
  
  // In-Node Message A/B Testing
  isMessageABTestEnabled?: boolean;
  messageVariants?: MessageVariant[];
  messageTestGoal?: 'ctr' | 'lead_tag' | 'purchase' | 'response' | 'human_handover';
  messageTestGoalTag?: string;
  messageActiveVariantPreview?: string; // 'variant_a' | 'variant_b'
  
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
  id?: string;
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

export interface FlowVersion {
  id: string;
  flowId: string;
  versionNumber?: number;
  name: string;
  description?: string;
  createdAt: string;
  createdBy?: string;
  isAutoSave?: boolean;
  nodes: FlowNode[];
  connections: FlowConnection[];
  nodeCount: number;
  connectionCount: number;
  source?: 'mongodb' | 'local';
}

export interface FlowAuditOrphanNode {
  node: FlowNode;
  incomingCount: number;
  outgoingCount: number;
  isCompletelyOrphan: boolean; // 0 in, 0 out
  isDeadEnd: boolean;         // >0 in, 0 out (non-end node)
  isUnreachable: boolean;     // 0 in, >0 out (non-trigger)
  reason: string;
}

export interface FlowAuditReport {
  totalNodes: number;
  totalConnections: number;
  orphanNodes: FlowAuditOrphanNode[];
  hasIssues: boolean;
  score: number; // 0 to 100
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
  | 'note_added'
  | 'lead_created'
  | 'sms_received';

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

export type CustomFieldValidationType =
  | 'none'
  | 'email'
  | 'phone_br'
  | 'phone_e164'
  | 'cpf'
  | 'cnpj'
  | 'cep'
  | 'url'
  | 'date_iso'
  | 'currency'
  | 'number_only'
  | 'custom_regex';

export interface CustomFieldDefinition {
  id: string;
  name: string;
  key: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  description?: string;
  options?: string[];
  defaultValue?: string;
  // Validation fields (Regex for emails, phones, documents, etc.)
  validationType?: CustomFieldValidationType;
  regexPattern?: string;
  regexFlags?: string;
  validationErrorMessage?: string;
  isRequired?: boolean;
  // External CRM Integration fields
  crmTargetField?: string;
  crmPlatformPreset?: 'generic' | 'rd_station' | 'hubspot' | 'active_campaign' | 'salesforce' | 'pipedrive';
  normalizationRule?: 'none' | 'lowercase' | 'uppercase' | 'digits_only' | 'trim';
  createdAt: string;
}

export interface SystemVariable {
  id: string;
  key: string;              // e.g. "business_hours", "default_currency", "timezone"
  name: string;             // e.g. "Horário de Atendimento", "Moeda Padrão", "Fuso Horário"
  value: string;            // e.g. "Segunda a Sexta, das 09:00 às 18:00", "BRL (R$)", "America/Sao_Paulo (GMT-3)"
  category: 'operations' | 'finance' | 'contact' | 'brand' | 'custom';
  type: 'text' | 'time_range' | 'currency' | 'timezone' | 'email' | 'phone' | 'url' | 'number' | 'boolean';
  description?: string;
  isSystemDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutoTaggingRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  keywords: string[];                 // Words or phrases to match (e.g. ['preço', 'valor', 'quanto custa'])
  matchType: 'contains' | 'exact' | 'regex'; // Match condition
  tagsToAdd: string[];                // Tags automatically applied to contact
  tagsToRemove?: string[];            // Tags optionally removed from contact
  channelFilter: 'all' | 'instagram' | 'messenger'; // Scope of detection
  caseSensitive?: boolean;
  priority?: 'high' | 'medium' | 'low';
  timesTriggered: number;
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AutoTaggingExecutionLog {
  id: string;
  ruleId: string;
  ruleName: string;
  contactId: string;
  contactName: string;
  contactUsername: string;
  channel: 'instagram' | 'messenger';
  matchedKeyword: string;
  tagsAdded: string[];
  tagsRemoved?: string[];
  messageSnippet: string;
  executedAt: string;
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
  channel: 'instagram' | 'messenger' | 'whatsapp' | 'sms';
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
  channel: 'instagram' | 'messenger' | 'omnichannel' | 'whatsapp' | 'sms';
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

export type ConversionEventType =
  | 'lead_generated'
  | 'sale_completed'
  | 'appointment_booked'
  | 'tag_added'
  | 'flow_completed'
  | 'cart_abandoned'
  | 'pix_paid'
  | 'contact_qualified';

export interface ConversionWebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: ConversionEventType[];
  isActive: boolean;
  direction?: 'outbound' | 'inbound';
  targetPlatform?: 'custom_webhook' | 'rd_station' | 'hubspot' | 'active_campaign' | 'zapier' | 'n8n' | 'make' | 'hotmart' | 'kiwify';
  secretToken?: string;
  headers?: { key: string; value: string }[];
  includeCustomFields?: boolean;
  includeContactData?: boolean;
  retryOnFailure?: boolean;
  maxRetries?: number; // e.g. 3 to 10
  retryIntervalSeconds?: number; // e.g. 15, 30, 60 seconds
  backoffStrategy?: 'exponential' | 'fixed' | 'linear';
  timeoutSeconds?: number; // e.g. 5, 10, 30 seconds
  retryableStatusCodes?: number[];
  description?: string;
  lastDeliveryStatus?: 'success' | 'failed' | 'idle';
  lastDeliveryAt?: string;
  lastStatusCode?: number;
  totalDeliveries: number;
  totalErrors: number;
  createdAt: string;
  updatedAt?: string;
}

export interface WebhookSettingsState {
  endpoints: WebhookEndpointConfig[];
  conversionEndpoints?: ConversionWebhookEndpoint[];
  globalVerifyToken: string;
  appSecret: string;
  serverBaseUrl: string;
  enableLogging: boolean;
  
  // Resilient Delivery & Retry Policies
  autoRetryFailed?: boolean;
  maxRetryAttempts?: number;
  retryIntervalSeconds?: number;
  retryBackoffStrategy?: 'exponential' | 'fixed' | 'linear';
  retryTimeoutSeconds?: number;
  retryableStatusCodes?: number[];
  deadLetterQueueEnabled?: boolean;
  jitterEnabled?: boolean;
  verificationStatus?: 'verified' | 'pending';
  activeFields?: string[];
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
  // Package, expiration & subscription administration
  plan?: string;
  planName?: string;
  billingCycle?: 'monthly' | 'quarterly' | 'semiannual' | 'yearly' | 'lifetime';
  expiresAt?: string; // Expiration / renewal date (ISO string: YYYY-MM-DD)
  dueDate?: string;
  blockOnExpire?: boolean;
  phone?: string;
  notes?: string;
  isDemo?: boolean;
  customLimits?: {
    maxFlows?: number;
    maxContacts?: number;
    maxUsers?: number;
    maxAiMessages?: number;
    enableWebhooks?: boolean;
    enableApi?: boolean;
  };
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
  cnameHost?: string; // e.g. "app" or "chat"
  cnameTarget?: string; // e.g. "cname.manyflow.io"
  sslIssuedAt?: string;
  nginxConfigSnippet?: string;
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
  plan: 'starter' | 'pro' | 'enterprise' | 'whitelabel' | string;
  planId?: string;
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

// ============================================================================
// --- SUBSCRIPTION PLANS & BILLING PACKAGES TYPES (ADMIN CRUD) ---
// ============================================================================

export interface PlanLimits {
  maxContacts: number;
  maxFlows: number;
  maxUsers: number;
  maxCustomDomains: number;
  maxMonthlyMessages: number;
  includeAI: boolean;
  includeWhiteLabel: boolean;
  includeLiveChat: boolean;
  includeApiAccess: boolean;
  includeWhatsAppBulk: boolean;
}

export interface SubscriptionPlan {
  id: string; // e.g. "plan_starter", "plan_pro", "plan_whitelabel"
  name: string; // e.g. "Iniciante", "Profissional", "White-Label Agência"
  slug: string;
  description: string;
  priceMonthly: number; // e.g. 97, 197, 497
  priceYearly: number; // e.g. 970, 1970, 4970 (discounted)
  currency: string; // 'BRL' | 'USD'
  billingInterval: 'monthly' | 'yearly';
  badge?: string; // e.g. "Mais Vendido", "Melhor Valor", "Exclusivo Revenda"
  isHighlighted: boolean;
  isActive: boolean;
  limits: PlanLimits;
  features: string[]; // List of promotional bullet items
  commissionRate: number; // Affiliate commission % (e.g. 30 for 30%)
  isRecurrentCommission: boolean; // Pays every month the client stays active
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPaymentStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';
export type SubscriptionPaymentMethod = 'pix' | 'credit_card' | 'bank_slip';

export interface CustomerSubscription {
  id: string; // e.g. "sub_10928"
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  amount: number; // R$ valor da mensalidade
  currency: string; // 'BRL'
  billingCycle: 'monthly' | 'yearly';
  status: SubscriptionPaymentStatus;
  paymentMethod: SubscriptionPaymentMethod;
  dueDate: string; // YYYY-MM-DD
  paidAt?: string;
  nextBillingDate: string; // YYYY-MM-DD
  pixCopyPasteCode?: string;
  invoicePdfUrl?: string;
  notes?: string;
  remindersSent: number;
  lastReminderAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AddonCategory = 'messages' | 'contacts' | 'domains' | 'ai_agents' | 'team_seats' | 'custom';

export interface AddonPackage {
  id: string; // e.g. "pkg_msg_50k"
  name: string; // e.g. "Pacote +50.000 Mensagens WhatsApp & Direct"
  slug: string;
  category: AddonCategory;
  description: string;
  price: number; // R$
  billingType: 'recurring_monthly' | 'one_time';
  unitAmount: number; // e.g. 50000
  unitLabel: string; // e.g. "+50.000 disparos/mês"
  badge?: string; // e.g. "Mais Vendido"
  isActive: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// --- AFFILIATE & RESELLER / WHITE-LABEL SYSTEM TYPES ---
// ============================================================================

export type AffiliateStatus = 'active' | 'pending_approval' | 'suspended';
export type AffiliatePayoutMethod = 'pix' | 'bank_transfer' | 'paypal' | 'stripe';
export type AffiliateSaleStatus = 'pending' | 'approved' | 'paid' | 'refunded';
export type PayoutRequestStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface AffiliateAccount {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  tenantId: string;
  affiliateCode: string; // Unique referral code, e.g. "MARCOS30"
  affiliateLink: string; // Full URL e.g. "https://app.manyflow.io/?ref=MARCOS30"
  customSubdomain?: string; // e.g. "marcos.manyflow.io" or custom white-label link
  commissionRate: number; // Commission percentage, e.g. 30%
  isRecurrent: boolean; // Monthly recurring commission
  status: AffiliateStatus;
  
  // Payout info
  payoutMethod: AffiliatePayoutMethod;
  payoutKey: string; // e.g. Pix key or IBAN
  payoutHolderName: string;
  payoutTaxId?: string; // CPF / CNPJ
  
  // Financial metrics
  totalEarnings: number; // R$ total generated
  pendingBalance: number; // R$ awaiting payment
  paidBalance: number; // R$ already transferred
  availableForWithdrawal: number; // R$ eligible for withdrawal
  
  // Conversion metrics
  totalClicks: number;
  totalLeads: number;
  totalPaidClients: number;
  conversionRatePercent: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateSale {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  customerName: string;
  customerEmail: string;
  customerTenantId?: string;
  planId: string;
  planName: string;
  saleAmount: number; // R$
  commissionAmount: number; // R$
  commissionRate: number; // %
  billingCycle: 'monthly' | 'yearly';
  status: AffiliateSaleStatus;
  isRecurrentMonth: number; // 1 = 1st month, 2 = 2nd month...
  createdAt: string;
  paidAt?: string;
}

export interface AffiliatePayoutRequest {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  affiliateName: string;
  amount: number; // R$
  payoutMethod: AffiliatePayoutMethod;
  payoutKey: string;
  payoutHolderName: string;
  payoutTaxId?: string;
  status: PayoutRequestStatus;
  requestedAt: string;
  processedAt?: string;
  transactionReceipt?: string;
  adminNotes?: string;
}

export interface AffiliateReferralLink {
  id: string;
  affiliateId: string;
  title: string;
  slug: string;
  fullUrl: string;
  destinationPage: 'home' | 'plans' | 'checkout' | 'whatsapp_direct';
  customCoupon?: string;
  discountPercent?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  clicks: number;
  leads: number;
  conversions: number;
  totalEarned: number;
  isActive: boolean;
  createdAt: string;
}

export interface AffiliateCommissionRule {
  id: string;
  planId: string;
  planName: string;
  defaultCommissionRate: number; // e.g. 30%
  customRateForUser?: number;
  isRecurrent: boolean; // Monthly recurring
  minSalesForBonus?: number;
  bonusAmount?: number;
}

export interface DnsCheckNode {
  location: string;
  countryCode: string;
  dnsServer: string;
  status: 'passed' | 'warning' | 'failed';
  resolvedIpOrCname: string;
  latencyMs: number;
  ttlSeconds: number;
}

export interface DnsValidationReport {
  domain: string;
  expectedCname: string;
  status: 'fully_propagated' | 'partially_propagated' | 'not_found' | 'error';
  cnameRecordVerified: boolean;
  aRecordFallback: string;
  sslCertificateActive: boolean;
  sslIssuer?: string;
  sslExpiresInDays?: number;
  httpPort3000Reachable: boolean;
  proxyCloudflareDetected: boolean;
  nodesChecked: DnsCheckNode[];
  nginxSnippet: string;
  caddySnippet: string;
  instructions: string[];
  testedAt: string;
}

// ============================================================================
// --- MULTI-APP FACEBOOK / META DEVELOPER APPS TYPES ---
// ============================================================================

export type FacebookAppType = 'business' | 'consumer' | 'gaming' | 'none';
export type FacebookAppStatus = 'active' | 'development' | 'restricted' | 'token_expired' | 'pending_review';

export interface FacebookPageAsset {
  id: string; // Facebook Page ID e.g. "10982348192"
  name: string; // e.g. "ManyFlow Brasil - Automações"
  category?: string; // e.g. "Marketing / Software"
  followersCount?: number;
  instagramBusinessId?: string;
  instagramUsername?: string; // e.g. "@manyflow.oficial"
  instagramAvatarUrl?: string;
  pageAccessToken?: string;
  isWebhookSubscribed?: boolean;
  tasks?: string[];
}

export interface FacebookWhatsAppAsset {
  wabaId: string; // WhatsApp Business Account ID e.g. "1982736412"
  phoneNumberId: string;
  displayPhoneNumber: string; // e.g. "+55 11 99999-8888"
  verifiedName: string;
  qualityRating?: 'GREEN' | 'YELLOW' | 'RED';
}

export interface FacebookApp {
  id: string;
  name: string; // e.g. "App Principal da Agência", "E-commerce Alpha Meta App"
  appId: string; // Meta App ID e.g. "982736154819203"
  appSecret?: string; // Meta App Secret e.g. "a8f9b2c3d4e5f6..."
  appType: FacebookAppType;
  status: FacebookAppStatus;
  apiVersion: string; // e.g. "v21.0"
  
  // User & Tenant attribution
  ownerUserId: string; // User ID who created/owns this app
  ownerUserName?: string;
  ownerUserEmail?: string;
  tenantId: string; // Active Workspace ID
  assignedUserIds: string[]; // ['all'] or list of user IDs allowed to manage
  
  // Meta Tokens & Webhook
  systemUserToken?: string; // Permanent System User Token
  verifyToken: string; // Webhook Verify Token
  webhookCallbackUrl: string; // Full callback URL
  isWebhookLive: boolean;
  
  // Assets connected through this App
  pages: FacebookPageAsset[];
  whatsAppAccounts: FacebookWhatsAppAsset[];
  
  // Permissions & Rate limits
  approvedPermissions: string[]; // e.g. ["pages_messaging", "instagram_manage_messages", ...]
  rateLimitUsagePercent: number; // 0-100%
  isDefault: boolean; // Primary app for this user/tenant
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastCheckedAt?: string;
}

// ============================================================================
// --- FACEBOOK GRAPH API & PAGE LINKING TYPES ---
// ============================================================================

export type FacebookGraphApiTokenType = 'PAGE_ACCESS_TOKEN' | 'USER_ACCESS_TOKEN' | 'SYSTEM_USER' | 'APP_ACCESS_TOKEN';

export interface FacebookGraphTokenDebugResult {
  isValid: boolean;
  tokenType: FacebookGraphApiTokenType;
  appId: string;
  applicationName?: string;
  userId?: string;
  userName?: string;
  pageId?: string;
  pageName?: string;
  expiresAt: string | 'never';
  isPermanent: boolean;
  issuedAt?: string;
  dataAccessExpiresAt?: string;
  scopes: string[];
  granularScopes?: { scope: string; targetIds?: string[] }[];
  profileId?: string;
  error?: string;
}

export interface FacebookPageLinkItem {
  id: string; // Facebook Page ID e.g. "10982348192"
  name: string; // e.g. "ManyFlow Brasil - Atendimento & Vendas"
  category: string; // e.g. "Software / Marketing Digital"
  avatarUrl: string;
  followersCount: number;
  appId: string; // Associated Meta App ID
  pageAccessToken: string; // Long-lived / permanent page token
  tokenExpiresAt: string | 'never';
  isTokenPermanent: boolean;
  instagramBusinessId?: string;
  instagramUsername?: string; // e.g. "@manyflow.oficial"
  instagramAvatarUrl?: string;
  instagramFollowersCount?: number;
  isWebhookSubscribed: boolean;
  subscribedFields: string[]; // e.g. ['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads', 'message_reactions', 'feed']
  tasks: string[]; // e.g. ['MANAGE', 'MESSAGING', 'ANALYZE']
  status: 'connected' | 'token_expired' | 'webhook_pending' | 'restricted';
  tenantId?: string;
  linkedAt: string;
  lastSyncAt: string;
  lastTestResult?: {
    success: boolean;
    latencyMs: number;
    statusCode: number;
    testedAt: string;
    message: string;
  };
}

export interface FacebookGraphPermissionDef {
  scope: string;
  name: string;
  category: 'messaging' | 'instagram' | 'pages' | 'business' | 'advanced';
  description: string;
  featureImpact: string;
  requiredFor: string[];
  isEssential: boolean;
  requiresAppReview: boolean;
  status: 'granted' | 'missing' | 'pending_review' | 'not_requested';
}

export interface FacebookLongLivedTokenExchangeRequest {
  appId: string;
  appSecret: string;
  shortLivedUserToken: string;
  pageId?: string;
}

export interface FacebookLongLivedTokenExchangeResponse {
  success: boolean;
  longLivedUserToken?: string;
  userTokenExpiresInSeconds?: number;
  userTokenExpiresAt?: string;
  pageAccessToken?: string;
  isPageTokenPermanent?: boolean;
  tokenType: FacebookGraphApiTokenType;
  scopes?: string[];
  error?: string;
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

// Auto Moderation & Spam Shield Types
export interface KeywordModerationRule {
  id: string;
  phrase: string;
  matchType: 'contains' | 'exact' | 'regex' | 'wildcard';
  severity: 'high' | 'medium' | 'low';
  action: 'warn_and_delete' | 'delete_only' | 'instant_kick' | 'kick_and_blacklist';
  enabled: boolean;
  category: 'scam_crypto' | 'adult' | 'external_groups' | 'profanity' | 'piracy' | 'custom';
}

export interface DomainFilterRule {
  id: string;
  domainOrPattern: string;
  type: 'whitelist' | 'blacklist';
  description: string;
  enabled: boolean;
  actionIfBlacklisted: 'delete_only' | 'warn_and_delete' | 'instant_kick';
}

export interface AutoModerationConfig {
  id: string;
  groupJid?: string; // empty means global default
  name: string;
  enabled: boolean;
  
  // Keyword Filters
  keywordFilter: {
    enabled: boolean;
    sensitivity: 'high' | 'standard' | 'low';
    customKeywords: KeywordModerationRule[];
    presetPacks: {
      antiScamCrypto: boolean;
      antiAdultContent: boolean;
      antiExternalGroupInvites: boolean;
      antiAggressiveProfanity: boolean;
    };
    defaultAction: 'warn_and_delete' | 'delete_only' | 'instant_kick' | 'kick_and_blacklist';
  };

  // Link Blocker
  linkBlocker: {
    enabled: boolean;
    mode: 'block_all_except_whitelist' | 'block_blacklisted_only' | 'block_all_links';
    allowAdminsToSendLinks: boolean;
    allowMediaWithCaptionLinks: boolean;
    domains: DomainFilterRule[];
    action: 'delete_only' | 'warn_and_delete' | 'instant_kick' | 'kick_and_blacklist';
    strikeLimitBeforeKick: number;
  };

  // Spam & Flood Behavior
  spamBehavior: {
    enabled: boolean;
    maxMessagesWindow: number; // ex: 4 messages
    windowSeconds: number; // in 5 seconds
    blockDuplicateConsecutiveMsgs: boolean;
    duplicateThreshold: number; // 2 identical messages
    blockForeignPhoneNumbers: boolean;
    allowedCountryCodes: string[]; // ['+55', '+351', '+1']
    blockMassMentions: boolean; // block @all if sent by non-admin
    blockContactCardsAndInvites: boolean;
    actionOnViolation: 'warn_and_delete' | 'delete_only' | 'instant_kick' | 'kick_and_blacklist';
    strikeLimit: number; // default 3
    autoBlacklistOnKick: boolean;
  };

  // Automated Warning & Strike System
  strikeSystem: {
    enabled: boolean;
    maxStrikes: number; // 3
    strikeExpirationHours: number; // 24h
    sendPublicWarningInGroup: boolean;
    sendPrivateWarningDm: boolean;
    warningMessageTemplate: string;
    kickMessageTemplate: string;
  };

  stats: {
    messagesScanned: number;
    linksBlocked: number;
    keywordsFiltered: number;
    spamFloodsStopped: number;
    membersKicked: number;
    membersWarned: number;
  };
}

export interface ModerationIncident {
  id: string;
  timestamp: string;
  groupJid: string;
  groupName: string;
  memberPhone: string;
  memberName: string;
  memberAvatar?: string;
  triggerType: 'keyword_violation' | 'link_blocker' | 'flood_spam' | 'duplicate_text' | 'foreign_prefix' | 'mass_mention' | 'vcard_spam' | 'blacklisted_user';
  triggerDetail: string; // ex: "Link proibido detectado: t.me/joinchat_xyz"
  originalMessage: string;
  actionTaken: 'message_deleted' | 'member_warned' | 'member_kicked' | 'member_blacklisted' | 'quarantined';
  strikeCount: number;
  maxStrikes: number;
  status: 'active' | 'reverted' | 'banned_permanently';
  resolvedAt?: string;
  canRevert: boolean;
}

export interface BlacklistedMember {
  id: string;
  phone: string;
  name: string;
  reason: string;
  category: 'spammer' | 'phishing' | 'bad_actor' | 'abusive' | 'manual';
  blockedAt: string;
  blockedBy: string;
  autoKickOnJoin: boolean;
  totalAttemptsBlocked: number;
}

// ============================================================================
// --- ACTIVITY LOGS (AUDIT TRAIL) TYPES ---
// ============================================================================

export type ActivityLogCategory = 'flow' | 'broadcast' | 'webhook' | 'team' | 'meta_app' | 'settings' | 'contacts' | 'ai_agent' | 'auth' | 'postiz' | 'httpsms';
export type ActivityLogStatus = 'success' | 'warning' | 'error' | 'info';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  userRole?: string;
  tenantId: string;
  category: ActivityLogCategory;
  action: string; // e.g. "flow.updated", "broadcast.sent", "webhook.created"
  title: string; // e.g. "Fluxo 'Black Friday 2026' atualizado"
  description: string; // e.g. "Adicionou nó de Mensagem e configurou teste A/B com 50% de tráfego"
  entityType?: 'flow' | 'broadcast' | 'webhook' | 'user' | 'contact' | 'facebook_app' | 'domain' | 'settings' | 'postiz' | 'httpsms';
  entityId?: string;
  entityName?: string;
  ipAddress?: string;
  userAgent?: string;
  status: ActivityLogStatus;
  metadata?: Record<string, any>;
  diff?: {
    before?: any;
    after?: any;
  };
  createdAt: string;
}

// ============================================================================
// --- WEBHOOK SUBSCRIPTIONS (EVENT-DRIVEN DISPATCH) TYPES ---
// ============================================================================

export type WebhookEventTopic =
  | 'contact.created'
  | 'contact.updated'
  | 'contact.tag_added'
  | 'contact.tag_removed'
  | 'contact.opt_out'
  | 'message.received'
  | 'message.sent'
  | 'comment.received'
  | 'comment.replied'
  | 'flow.started'
  | 'flow.step_completed'
  | 'flow.completed'
  | 'flow.error'
  | 'broadcast.started'
  | 'broadcast.completed'
  | 'broadcast.failed'
  | 'chat.handover_requested'
  | 'chat.resolved';

export interface WebhookHeader {
  key: string;
  value: string;
}

export interface WebhookSubscription {
  id: string;
  name: string; // e.g. "CRM HubSpot Sync", "Notificador Slack Leads"
  targetUrl: string; // e.g. "https://api.hubapi.com/webhooks/v1/..."
  secret: string; // HMAC secret token
  events: WebhookEventTopic[]; // List of subscribed event topics
  isActive: boolean;
  tenantId: string;
  headers?: WebhookHeader[];
  retryCount: number; // e.g. 3
  timeoutSeconds: number; // e.g. 10
  format: 'json' | 'form_data';
  description?: string;
  stats: {
    totalSent: number;
    successCount: number;
    failureCount: number;
    lastStatusCode?: number;
    lastLatencyMs?: number;
    lastSentAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WebhookSubscriptionDeliveryLog {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  event: WebhookEventTopic;
  targetUrl: string;
  statusCode: number;
  durationMs: number;
  status: 'success' | 'failed' | 'timeout';
  requestPayload: any;
  requestHeaders?: Record<string, string>;
  responseBody?: string;
  errorMessage?: string;
  attempts: number;
  createdAt: string;
}

// ============================================================================
// --- EXTERNAL MESSAGE WEBHOOKS & CALLBACK AUTHENTICATION TYPES ---
// ============================================================================

export type ExternalWebhookAuthType = 
  | 'bearer'
  | 'api_key'
  | 'hmac_sha256'
  | 'basic'
  | 'oauth2_client_credentials'
  | 'none';

export type ExternalMessageEventType =
  | 'new_message'
  | 'comment_mention'
  | 'message.received'
  | 'message.sent'
  | 'message.media_received'
  | 'message.audio_transcribed'
  | 'message.delivered'
  | 'message.read'
  | 'message.reaction'
  | 'message.postback'
  | 'message.story_reply'
  | 'message.story_mention'
  | 'message.failed'
  | 'comment.received'
  | 'comment.replied';

export type ExternalWebhookPlatformPreset =
  | 'custom_rest'
  | 'n8n'
  | 'make'
  | 'zapier'
  | 'typebot'
  | 'evolution_api'
  | 'chatwoot'
  | 'zapi'
  | 'meta_cloud_api';

export type ExternalWebhookPayloadFormat =
  | 'standard_json'
  | 'meta_graph_compatible'
  | 'typebot_compatible'
  | 'n8n_structured';

export interface ExternalMessageWebhookEndpoint {
  id: string;
  name: string;
  description?: string;
  targetUrl: string;
  platform: ExternalWebhookPlatformPreset;
  channelFilter: ChannelType;
  events: ExternalMessageEventType[];
  isActive: boolean;
  
  // Authentication Configuration
  authType: ExternalWebhookAuthType;
  bearerToken?: string;
  apiKeyHeaderName?: string;
  apiKeyValue?: string;
  hmacSecret?: string;
  hmacHeaderName?: string;
  basicUsername?: string;
  basicPassword?: string;
  verifyToken?: string;
  
  // Custom headers
  customHeaders?: { key: string; value: string }[];
  
  // Payload & Delivery Settings
  payloadFormat: ExternalWebhookPayloadFormat;
  includeContactMetadata: boolean;
  includeCustomFields: boolean;
  includeRawPayload: boolean;
  timeoutSeconds: number;
  maxRetries: number;
  retryPolicy?: WebhookRetryPolicy;
  
  // Statistics
  stats: {
    totalSent: number;
    successCount: number;
    failedCount: number;
    lastLatencyMs?: number;
    lastStatusCode?: number;
    lastDispatchedAt?: string;
  };
  
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export type WebhookBackoffStrategy = 'exponential' | 'exponential_jitter' | 'linear' | 'fixed' | 'fibonacci';

export interface WebhookRetryPolicy {
  enabled: boolean;
  maxRetries: number; // 1 to 10 attempts (default 3 or 5)
  initialIntervalSeconds: number; // Initial wait T0 (e.g. 1s, 2s, 5s)
  multiplier: number; // Factor multiplier (e.g. 2.0x, 1.5x)
  maxIntervalSeconds: number; // Capped max interval (e.g. 300s, 600s, 3600s)
  strategy: WebhookBackoffStrategy;
  enableJitter: boolean; // Randomize delay within range to prevent Thundering Herd
  retryableStatusCodes: number[]; // e.g. [408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524]
  nonRetryableStatusCodes: number[]; // e.g. [400, 401, 403, 404, 422]
  deadLetterQueue: {
    enabled: boolean;
    notifyOnExhausted?: boolean;
    autoPurgeDays?: number;
  };
}

export interface WebhookRetryStepInfo {
  attempt: number;
  delaySeconds: number;
  cumulativeWaitSeconds: number;
  scheduledAtEstimateIso?: string;
  description: string;
}

export interface WebhookRetryAttemptLog {
  attemptNumber: number;
  scheduledAt: string;
  executedAt: string;
  delaySeconds: number;
  statusCode: number;
  durationMs: number;
  status: 'success' | 'failed' | 'timeout';
  errorMessage?: string;
  responseSnippet?: string;
}

export interface ExternalWebhookDeliveryEvent {
  id: string;
  endpointId: string;
  endpointName: string;
  event: ExternalMessageEventType;
  targetUrl: string;
  channel: ChannelType;
  statusCode: number;
  durationMs: number;
  status: 'success' | 'failed' | 'timeout';
  requestPayload: any;
  requestHeaders?: Record<string, string>;
  responseBody?: string;
  errorMessage?: string;
  attempts: number;
  maxAttempts?: number;
  isRetry?: boolean;
  retryPolicyApplied?: WebhookRetryPolicy;
  retryHistory?: WebhookRetryAttemptLog[];
  nextRetryAt?: string;
  dlqStatus?: 'none' | 'queued' | 'reprocessed' | 'discarded';
  createdAt: string;
}

export interface WebhookRetryQueueItem {
  id: string;
  deliveryId: string;
  endpointId: string;
  endpointName: string;
  targetUrl: string;
  currentAttempt: number;
  maxRetries: number;
  scheduledExecutionAt: string;
  secondsRemaining: number;
  lastStatusCode?: number;
  lastErrorMessage?: string;
  payload: any;
  headers: Record<string, string>;
  retryPolicy: WebhookRetryPolicy;
  status: 'pending' | 'in_progress' | 'cancelled' | 'failed_exhausted';
  tenantId: string;
  createdAt: string;
}

export interface WebhookDeadLetterItem {
  id: string;
  deliveryId: string;
  endpointId: string;
  endpointName: string;
  targetUrl: string;
  event: ExternalMessageEventType;
  channel: ChannelType;
  totalAttempts: number;
  lastStatusCode?: number;
  lastErrorMessage?: string;
  payload: any;
  headers: Record<string, string>;
  retryHistory: WebhookRetryAttemptLog[];
  failedAt: string;
  status: 'queued' | 'reprocessed' | 'discarded';
  reprocessedAt?: string;
  tenantId: string;
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'rescheduled' | 'cancelled';

export interface Appointment {
  id: string;
  contactId: string;
  contactName: string;
  contactHandle?: string; // @username, phone or email
  contactPhone?: string;
  contactEmail?: string;
  channel: ChannelType;
  serviceTitle: string;
  serviceDurationMinutes: number;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  googleCalendarEventId?: string;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
  reminderSent24h?: boolean;
  reminderSent2h?: boolean;
}

export interface ChannelBookingConfig {
  channel: ChannelType;
  channelName: string;
  channelHandleOrNumber: string;
  enabled: boolean;
  autoConfirm: boolean;
  triggerKeywords: string[];
  welcomeButtonEnabled: boolean;
  defaultFlowId: string;
  calendarSyncEnabled: boolean;
  notifyStaffWhatsapp?: string;
  totalBookings: number;
  lastBookingAt?: string;
}

export interface AppointmentService {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  price?: string;
  active: boolean;
  color: string;
}

// ============================================================================
// --- POSTIZ (gitroomhq/postiz-app) INTEGRATION TYPES ---
// ============================================================================

export type PostizSocialPlatform = 
  | 'instagram' 
  | 'facebook' 
  | 'tiktok' 
  | 'x' 
  | 'linkedin' 
  | 'pinterest' 
  | 'threads' 
  | 'youtube';

export type PostizPostType = 'post' | 'reel' | 'story' | 'carousel' | 'short' | 'tweet';

export type PostizPostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';

export interface PostizSocialAccount {
  id: string;
  platform: PostizSocialPlatform;
  username: string;
  displayName: string;
  avatarUrl: string;
  isConnected: boolean;
  followerCount?: number;
  profileUrl?: string;
  accountType?: 'creator' | 'business' | 'personal';
}

export interface PostizScheduledPost {
  id: string;
  caption: string;
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'mixed' | 'text_only';
  platforms: PostizSocialPlatform[];
  postType: PostizPostType;
  scheduledAt: string; // ISO string
  publishedAt?: string;
  status: PostizPostStatus;
  firstComment?: string;
  bindGrowthToolId?: string; // Automatically bind to ManyFlow Comment Direct tool!
  tags: string[];
  analytics?: {
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    reach: number;
  };
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostizConfig {
  apiUrl: string;           // e.g. "http://localhost:5200" or custom server
  selfHostedUrl?: string;   // URL da instância auto-hospedada (ex: https://postiz.minhaempresa.com)
  apiKey: string;
  accessToken?: string;     // Token de acesso / Bearer da instância Postiz gitroomhq
  workspaceId: string;
  isConnected: boolean;
  autoSyncComments: boolean;
  syncScheduleEnabled?: boolean;
  autoSyncIntervalMinutes?: number; // 5, 15, 30, 60
  defaultPlatforms: PostizSocialPlatform[];
  lastSyncedAt?: string;
  serverVersion?: string;
  syncStatus?: 'connected' | 'error' | 'syncing' | 'disconnected';
}

// ============================================================================
// --- HTTPSMS (NdoleStudio/httpsms) SMS GATEWAY INTEGRATION TYPES ---
// ============================================================================

export type HttpSmsMessageStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
export type HttpSmsDirection = 'outbound' | 'inbound';
export type HttpSmsNetworkType = 'WIFI' | 'LTE_4G' | '5G' | 'OFFLINE';

export interface HttpSmsDeviceStatus {
  isConnected: boolean;
  deviceName: string; // e.g. "Samsung Galaxy S22 (Android 14)"
  batteryLevel: number; // 0 - 100
  isBatteryCharging: boolean;
  networkType: HttpSmsNetworkType;
  signalStrength: number; // 1 to 5 bars
  activeSimSlot: 1 | 2;
  sim1Number: string; // e.g. "+55 11 98765-4321"
  sim1Carrier: string; // e.g. "Vivo"
  sim2Number?: string;
  sim2Carrier?: string;
  lastHeartbeat: string;
  appVersion: string; // e.g. "v1.8.2"
}

export interface HttpSmsConfig {
  gatewayUrl: string; // e.g. "https://api.httpsms.com/v1" or self-hosted Go backend
  apiKey: string;
  defaultSenderNumber: string;
  webhookUrl: string;
  defaultSimSlot: 1 | 2;
  retryAttempts: number;
  delayBetweenMessagesSeconds: number;
  isEnabled: boolean;
  autoSyncWithLiveChat: boolean;
  // CRM Forwarding & Automation Options
  forwardInboundToCrm: boolean;
  crmAutoCreateLead: boolean;
  crmDefaultTag: string;
  crmLeadStage: string;
  crmNotifyResponsible: boolean;
  crmWebhookForwardUrl?: string;
  crmAssignToUserId?: string;
  forwardedToCrmCount?: number;
}

export interface HttpSmsMessage {
  id: string;
  direction: HttpSmsDirection;
  from: string;
  to: string;
  content: string;
  status: HttpSmsMessageStatus;
  simSlot: 1 | 2;
  failureReason?: string;
  timestamp: string;
  contactId?: string;
  contactName?: string;
}







