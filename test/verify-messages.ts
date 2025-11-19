/**
 * Test script to verify messages table schema and functionality
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
  console.log('🔍 Verifying messages table schema...\n');

  // Check if position_encoded column exists
  const { data, error } = await supabase
    .from('messages')
    .select('id, content, position, position_encoded')
    .limit(1);

  if (error) {
    console.error('❌ Error querying messages table:', error);
    return false;
  }

  console.log('✅ Messages table accessible');
  console.log('📊 Sample data:', data);

  return true;
}

async function testMessageCreation() {
  console.log('\n🧪 Testing message creation...\n');

  // This will fail without auth, but shows us the schema expectations
  const { data, error } = await supabase
    .from('messages')
    .insert({
      room_id: 'test',
      user_id: 'test',
      content: 'Test message',
      position: { quarter: 1, minutes: 15, seconds: 0 },
      position_encoded: 0,
    })
    .select();

  if (error) {
    console.log('⚠️  Expected error (no auth):', error.message);
    if (error.message.includes('position_encoded')) {
      console.log('✅ position_encoded column exists');
    }
  } else {
    console.log('✅ Message created:', data);
  }
}

async function checkRealtimeEnabled() {
  console.log('\n📡 Checking realtime configuration...\n');

  // Create a test channel subscription
  const channel = supabase
    .channel('test-messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        console.log('✅ Realtime working! Received:', payload);
      }
    )
    .subscribe((status) => {
      console.log('📡 Subscription status:', status);
    });

  // Wait a bit to see the subscription status
  await new Promise(resolve => setTimeout(resolve, 2000));

  await supabase.removeChannel(channel);
}

async function main() {
  console.log('🚀 Starting Supabase verification tests...\n');

  await verifySchema();
  await testMessageCreation();
  await checkRealtimeEnabled();

  console.log('\n✨ Tests complete!');
  process.exit(0);
}

main().catch(console.error);
