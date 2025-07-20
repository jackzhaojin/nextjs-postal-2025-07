import { MCPContextType } from '../schemas/task-schemas';

export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `req_${timestamp}_${random}`;
}

export function generateTaskId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `task_${timestamp}_${random}`;
}

export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `session_${timestamp}_${random}`;
}

export function generateSpanId(): string {
  return Math.random().toString(36).substr(2, 16);
}

export interface TraceEvent {
  requestId: string;
  spanId: string;
  parentSpanId?: string;
  event: string;
  timestamp: string;
  duration?: number;
  metadata?: Record<string, any>;
  level: 'debug' | 'info' | 'warn' | 'error';
}

export class TraceLogger {
  private context: MCPContextType;
  private events: TraceEvent[] = [];
  private spans: Map<string, { startTime: number; event: string }> = new Map();

  constructor(context: MCPContextType) {
    this.context = context;
  }

  startSpan(event: string, metadata?: Record<string, any>): string {
    const spanId = generateSpanId();
    const startTime = performance.now();
    
    this.spans.set(spanId, { startTime, event });
    
    this.log('debug', event, {
      type: 'span_start',
      spanId,
      ...metadata
    });

    return spanId;
  }

  endSpan(spanId: string, metadata?: Record<string, any>): void {
    const span = this.spans.get(spanId);
    if (!span) {
      this.log('warn', 'span_end_without_start', { spanId });
      return;
    }

    const duration = performance.now() - span.startTime;
    
    this.log('debug', span.event, {
      type: 'span_end',
      spanId,
      duration,
      ...metadata
    });

    this.spans.delete(spanId);
  }

  log(
    level: TraceEvent['level'],
    event: string,
    metadata?: Record<string, any>,
    parentSpanId?: string
  ): void {
    if (this.shouldLog(level)) {
      const traceEvent: TraceEvent = {
        requestId: this.context.requestId,
        spanId: generateSpanId(),
        parentSpanId,
        event,
        timestamp: new Date().toISOString(),
        metadata: {
          project: this.context.project,
          phase: this.context.phase,
          taskId: this.context.taskId,
          ...metadata
        },
        level
      };

      this.events.push(traceEvent);

      // Output to console based on trace level
      this.outputToConsole(traceEvent);
    }
  }

  private shouldLog(level: TraceEvent['level']): boolean {
    const traceLevel = this.context.metadata.traceLevel;
    
    switch (traceLevel) {
      case 'minimal':
        return level === 'error';
      case 'standard':
        return ['warn', 'error'].includes(level);
      case 'verbose':
        return true;
      default:
        return true;
    }
  }

  private outputToConsole(event: TraceEvent): void {
    const prefix = `[${event.level.toUpperCase()}] ${event.requestId}`;
    const message = `${prefix} - ${event.event}`;
    
    switch (event.level) {
      case 'error':
        console.error(message, event.metadata);
        break;
      case 'warn':
        console.warn(message, event.metadata);
        break;
      case 'info':
        console.info(message, event.metadata);
        break;
      case 'debug':
        console.debug(message, event.metadata);
        break;
    }
  }

  getEvents(): TraceEvent[] {
    return [...this.events];
  }

  getActiveSpans(): string[] {
    return Array.from(this.spans.keys());
  }

  summary(): {
    requestId: string;
    totalEvents: number;
    activeSpans: number;
    errors: number;
    warnings: number;
    duration: number;
  } {
    const errors = this.events.filter(e => e.level === 'error').length;
    const warnings = this.events.filter(e => e.level === 'warn').length;
    
    const firstEvent = this.events[0];
    const lastEvent = this.events[this.events.length - 1];
    const duration = firstEvent && lastEvent 
      ? new Date(lastEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime()
      : 0;

    return {
      requestId: this.context.requestId,
      totalEvents: this.events.length,
      activeSpans: this.spans.size,
      errors,
      warnings,
      duration
    };
  }
}

export function createTraceLogger(context: MCPContextType): TraceLogger {
  return new TraceLogger(context);
}

export function logContextBootstrap(context: MCPContextType, url: string): void {
  if (context.metadata.traceLevel !== 'minimal') {
    console.log('[MCP Context Bootstrap]', {
      requestId: context.requestId,
      project: context.project,
      phase: context.phase,
      taskId: context.taskId,
      url,
      timestamp: context.metadata.timestamp,
      traceLevel: context.metadata.traceLevel
    });
  }
}