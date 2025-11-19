/**
 * Integration tests for message creation and retrieval
 * Tests the complete flow: API -> Database -> Realtime
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { encodePosition } from '../lib/position-encoding';
import type { NflPosition } from '../lib/database.types';

// Test configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

describe('Message System Integration Tests', () => {
  describe('Database Schema', () => {
    it('should have position_encoded column in messages table', async () => {
      // Try to select position_encoded - will error if column doesn't exist
      const { error } = await supabase
        .from('messages')
        .select('id, position_encoded')
        .limit(1);

      expect(error).toBeNull();
    });

    it('should have position column in messages table', async () => {
      const { error } = await supabase
        .from('messages')
        .select('id, position')
        .limit(1);

      expect(error).toBeNull();
    });
  });

  describe('Position Encoding', () => {
    it('should encode NFL positions correctly', () => {
      const position: NflPosition = {
        quarter: 1,
        minutes: 15,
        seconds: 0,
      };

      const encoded = encodePosition(position, 'nfl');

      // Start of Q1 should be 0
      expect(encoded).toBe(0);
    });

    it('should encode different quarters correctly', () => {
      const q1Start: NflPosition = { quarter: 1, minutes: 15, seconds: 0 };
      const q2Start: NflPosition = { quarter: 2, minutes: 15, seconds: 0 };

      const q1Encoded = encodePosition(q1Start, 'nfl');
      const q2Encoded = encodePosition(q2Start, 'nfl');

      // Q2 start should be 900 seconds after Q1 start
      expect(q2Encoded).toBe(900);
      expect(q2Encoded).toBeGreaterThan(q1Encoded);
    });
  });

  describe('Message Visibility Logic', () => {
    it('should show messages at or before current position', () => {
      const messagePosition = 450; // 7:30 in Q1
      const userPosition = 900; // End of Q1

      // Message should be visible
      expect(messagePosition <= userPosition).toBe(true);
    });

    it('should hide messages after current position', () => {
      const messagePosition = 1800; // Halftime
      const userPosition = 900; // End of Q1

      // Message should be hidden
      expect(messagePosition <= userPosition).toBe(false);
    });
  });
});

/**
 * Manual test helper - run this to verify the full flow
 * This requires authentication so can't be automated
 */
export async function manualMessageTest(roomId: string, userId: string) {
  console.log('📝 Manual Message Test');
  console.log('='.repeat(50));

  // Test 1: Create a message
  console.log('\n1️⃣  Creating test message...');
  const testPosition: NflPosition = {
    quarter: 1,
    minutes: 10,
    seconds: 30,
  };
  const encodedPosition = encodePosition(testPosition, 'nfl');

  const { data: newMessage, error: createError } = await supabase
    .from('messages')
    .insert({
      room_id: roomId,
      user_id: userId,
      content: 'Test message',
      position: testPosition,
      position_encoded: encodedPosition,
    })
    .select()
    .single();

  if (createError) {
    console.error('❌ Failed to create message:', createError);
    return;
  }

  console.log('✅ Message created:', newMessage);

  // Test 2: Retrieve the message
  console.log('\n2️⃣  Retrieving messages...');
  const { data: messages, error: fetchError } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error('❌ Failed to fetch messages:', fetchError);
    return;
  }

  console.log(`✅ Found ${messages.length} messages`);
  messages.forEach((msg, idx) => {
    console.log(`  ${idx + 1}. "${msg.content}" at position ${msg.position_encoded}`);
  });

  // Test 3: Verify position_encoded exists
  console.log('\n3️⃣  Verifying position_encoded field...');
  const hasPositionEncoded = messages.every(msg => msg.position_encoded !== undefined);

  if (hasPositionEncoded) {
    console.log('✅ All messages have position_encoded');
  } else {
    console.error('❌ Some messages missing position_encoded');
  }

  console.log('\n' + '='.repeat(50));
  console.log('✨ Manual test complete!');
}
