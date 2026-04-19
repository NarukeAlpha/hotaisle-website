import { describe, expect, it } from 'bun:test';
import { parseMachineStatusEvent } from '@/lib/machine-status.ts';

describe('parseMachineStatusEvent', () => {
	const testCases = [
		{
			expected: { gpuCount: 4, status: 'reserved', type: 'vm' },
			input: { gpuCount: 4, status: 'reserved', type: 'vm' },
			name: 'accepts a valid vm payload with gpu count',
		},
		{
			expected: { status: 'deleted', type: 'bm' },
			input: { status: ' DELETED ', type: ' BM ' },
			name: 'normalizes casing and whitespace',
		},
		{
			expected: null,
			input: { status: 'reserved', type: 'vm' },
			name: 'rejects vm payloads without gpu counts',
		},
		{
			expected: null,
			input: { gpuCount: 4, status: 'pending', type: 'vm' },
			name: 'rejects unsupported statuses',
		},
		{
			expected: null,
			input: { gpuCount: 4, status: 'reserved', type: 'gpu' },
			name: 'rejects unsupported types',
		},
		{
			expected: null,
			input: { status: 'reserved', type: 'vm' },
			name: 'rejects incomplete payloads',
		},
		{
			expected: null,
			input: { gpuCount: 0.5, status: 'reserved', type: 'vm' },
			name: 'rejects invalid gpu counts for vms',
		},
		{
			expected: { gpuCount: 8, status: 'deleted', type: 'bm' },
			input: { gpuCount: 8, status: 'deleted', type: 'bm' },
			name: 'accepts extra gpu count data for bare metal without using it',
		},
	] as const;

	for (const testCase of testCases) {
		it(testCase.name, () => {
			expect(parseMachineStatusEvent(testCase.input)).toEqual(testCase.expected);
		});
	}
});
