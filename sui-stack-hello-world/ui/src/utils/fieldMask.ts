/**
 * Utilidades para trabajar con Field Masks en gRPC
 * Los Field Masks permiten especificar qué campos incluir en la respuesta
 */

export type FieldMaskPath =
  | '*' // Todos los campos
  | 'transaction'
  | 'effects'
  | 'events'
  | 'effects.status'
  | 'effects.executed_epoch'
  | 'effects.modified_at_versions'
  | 'effects.gas_used'
  | 'effects.status.status'
  | 'effects.status.error'
  | 'effects.shared_objects'
  | 'effects.transaction_digest'
  | 'effects.created'
  | 'effects.mutated'
  | 'effects.unwrapped'
  | 'effects.deleted'
  | 'effects.wrapped'
  | 'effects.gas_object'
  | 'effects.dependencies'
  | 'events'
  | 'bcs'
  | 'content'
  | 'digest'
  | 'version'
  | 'owner'
  | 'previous_transaction'
  | 'storage_rebate'
  | 'display'
  | 'summary'
  | 'summary.epoch'
  | 'summary.sequence_number'
  | 'summary.content_digest'
  | 'summary.timestamp'
  | 'summary.network_total_transactions'
  | 'summary.previous_digest'
  | 'transactions';

/**
 * Presets de field masks para casos comunes
 */
export const FIELD_MASK_PRESETS = {
  // Transacciones
  TRANSACTION_FULL: ['transaction', 'effects', 'events'] as FieldMaskPath[],
  TRANSACTION_EFFECTS_ONLY: ['effects'] as FieldMaskPath[],
  TRANSACTION_EVENTS_ONLY: ['events'] as FieldMaskPath[],

  // Objetos
  OBJECT_FULL: ['bcs', 'content', 'display'] as FieldMaskPath[],
  OBJECT_CONTENT_ONLY: ['content'] as FieldMaskPath[],
  OBJECT_BCS_ONLY: ['bcs'] as FieldMaskPath[],

  // Checkpoints
  CHECKPOINT_FULL: ['summary', 'transactions'] as FieldMaskPath[],
  CHECKPOINT_SUMMARY_ONLY: ['summary'] as FieldMaskPath[],
  CHECKPOINT_TRANSACTIONS_ONLY: ['transactions'] as FieldMaskPath[],

  // Todos los campos
  ALL_FIELDS: ['*'] as FieldMaskPath[],
};

/**
 * Valida que un path de field mask sea válido
 */
export function isValidFieldMaskPath(path: string): path is FieldMaskPath {
  const validPaths = new Set<string>(Object.values(FIELD_MASK_PRESETS).flat());
  return validPaths.has(path) || path === '*';
}

/**
 * Combina múltiples field masks, eliminando duplicados
 */
export function combineFieldMasks(...masks: FieldMaskPath[][]): FieldMaskPath[] {
  const combined = new Set<string>();
  for (const mask of masks) {
    for (const path of mask) {
      combined.add(path);
    }
  }
  return Array.from(combined) as FieldMaskPath[];
}

/**
 * Optimiza un field mask removiendo paths redundantes
 * Si "*" está presente, todos los otros paths son redundantes
 */
export function optimizeFieldMask(mask: FieldMaskPath[]): FieldMaskPath[] {
  if (mask.includes('*')) {
    return ['*'];
  }

  // Remover paths que son substrings de otros paths
  const sorted = mask.sort();
  return sorted.filter((path, index) => {
    return !sorted.some(
      (other, otherIndex) =>
        otherIndex !== index &&
        other.startsWith(path + '.') &&
        other !== path
    );
  });
}

/**
 * Crea un field mask personalizado basado en preferencias
 */
export interface FieldMaskOptions {
  includeEffects?: boolean;
  includeEvents?: boolean;
  includeContent?: boolean;
  includeBCS?: boolean;
  includeDisplay?: boolean;
  includeSummary?: boolean;
  includeTransactions?: boolean;
  custom?: FieldMaskPath[];
}

export function createCustomFieldMask(options: FieldMaskOptions): FieldMaskPath[] {
  const paths: FieldMaskPath[] = [];

  if (options.includeEffects) paths.push('effects');
  if (options.includeEvents) paths.push('events');
  if (options.includeContent) paths.push('content');
  if (options.includeBCS) paths.push('bcs');
  if (options.includeDisplay) paths.push('display');
  if (options.includeSummary) paths.push('summary');
  if (options.includeTransactions) paths.push('transactions');
  if (options.custom) paths.push(...options.custom);

  return optimizeFieldMask(paths);
}

/**
 * Formatea un field mask para visualización
 */
export function formatFieldMask(mask: FieldMaskPath[]): string {
  if (mask.includes('*')) {
    return 'Todos los campos';
  }

  return mask.join(', ');
}

/**
 * Extrae información útil de una respuesta según el field mask usado
 */
export function extractFieldsFromResponse<T extends Record<string, unknown>>(
  response: T,
  mask: FieldMaskPath[]
): Partial<T> {
  if (mask.includes('*')) {
    return response;
  }

  const result: Partial<T> = {};

  for (const path of mask) {
    const keys = path.split('.');
    let source: unknown = response;
    let target: any = result;

    // Navegar hasta el penúltimo nivel
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in source)) break;
      source = (source as Record<string, unknown>)[key];

      if (!(key in target)) {
        target[key] = {};
      }
      target = target[key];
    }

    // Copiar el valor final
    const finalKey = keys[keys.length - 1];
    if (source && typeof source === 'object' && finalKey in source) {
      target[finalKey] = (source as Record<string, unknown>)[finalKey];
    }
  }

  return result;
}

/**
 * Obtiene información sobre qué datos contiene una respuesta
 */
export function analyzeResponseFields(response: Record<string, unknown>): {
  presentFields: string[];
  hasEffects: boolean;
  hasEvents: boolean;
  hasContent: boolean;
} {
  const presentFields = Object.keys(response);

  return {
    presentFields,
    hasEffects: 'effects' in response,
    hasEvents: 'events' in response,
    hasContent: 'content' in response,
  };
}
