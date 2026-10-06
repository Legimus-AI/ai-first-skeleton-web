// Event types without a label here (added later by the API) show their raw name.
const EVENT_TYPE_LABELS: Record<string, string> = {
	'*': 'Todos los eventos',
	'todo.created': 'Tarea creada',
	'todo.updated': 'Tarea actualizada',
	'todo.deleted': 'Tarea eliminada',
}

export function eventTypeLabel(eventType: string): string {
	return EVENT_TYPE_LABELS[eventType] ?? eventType
}
