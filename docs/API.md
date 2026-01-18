# API Documentation

## Supabase Integration

LegallyAI uses Supabase for:
- **Authentication:** User sign-up, login, and session management
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Storage:** Document uploads and file management
- **Edge Functions:** Serverless API endpoints

## Environment Configuration

Required environment variables:

```env
VITE_SUPABASE_URL=https://wejiqqtwnhevcjdllodr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=wejiqqtwnhevcjdllodr
```

## Authentication

### Sign Up
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password'
});
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
});
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

### Get Current User
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

## Database Operations

### Query Data
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', 'value');
```

### Insert Data
```typescript
const { data, error } = await supabase
  .from('table_name')
  .insert([
    { column1: 'value1', column2: 'value2' }
  ]);
```

### Update Data
```typescript
const { data, error } = await supabase
  .from('table_name')
  .update({ column: 'new_value' })
  .eq('id', userId);
```

### Delete Data
```typescript
const { data, error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', recordId);
```

## Storage

### Upload File
```typescript
const { data, error } = await supabase.storage
  .from('bucket_name')
  .upload('file_path', file);
```

### Download File
```typescript
const { data, error } = await supabase.storage
  .from('bucket_name')
  .download('file_path');
```

### Get Public URL
```typescript
const { data } = supabase.storage
  .from('bucket_name')
  .getPublicUrl('file_path');
```

## Edge Functions

Edge functions are located in `supabase/functions/`.

### Invoke Function
```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { param1: 'value1' }
});
```

### Available Functions
- `webhook-handler` - Handles incoming webhooks and logs to database

## Error Handling

Always check for errors in Supabase operations:

```typescript
const { data, error } = await supabase.from('table').select('*');

if (error) {
  console.error('Error:', error.message);
  // Handle error appropriately
} else {
  // Process data
}
```

## Real-time Subscriptions

Subscribe to database changes:

```typescript
const subscription = supabase
  .channel('table_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'table_name' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

## Security

- **Row Level Security (RLS):** All tables have RLS enabled
- **API Keys:** Use anon key for client-side, service key for server-side
- **HTTPS Only:** All API calls must use HTTPS
- **JWT Tokens:** Automatically handled by Supabase client

## Rate Limits

Supabase free tier limits:
- 500 MB database space
- 1 GB file storage
- 50,000 monthly active users
- 2 GB bandwidth

For production, consider upgrading to Pro tier.

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com/)
- [GitHub Issues](https://github.com/Legallyai-1/legallyai-nexus-4b3048fb/issues)
