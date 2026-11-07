import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

export function AccountPanel({onSession}:{onSession:(session:Session|null)=>void}) {
  const [session,setSession]=useState<Session|null>(null);
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    if(!supabase)return;
    let active=true;
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{if(active){setSession(next);onSession(next);}});
    return()=>{active=false;subscription.unsubscribe();};
  },[onSession]);
  if(!supabase)return <p className="honest-note">Online play needs Supabase configuration. You can keep exploring offline.</p>;
  return <section aria-label="Player account"><h3>Your account</h3>{session?<><p>Signed in as {session.user.email}</p><button onClick={async()=>{const result=await supabase!.auth.signOut();if(result.error)setError(result.error.message);}}>Sign out</button></>:<form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{const result=await supabase!.auth.signInWithPassword({email,password});if(result.error)setError(result.error.message);else setPassword('');}catch{setError('Could not reach the account service. Try again.');}finally{setBusy(false);}}}><label>Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={busy}>{busy?'Signing in…':'Sign in'}</button><p className="honest-note">Use your invited world account.</p></form>}{error&&<p role="alert">{error}</p>}</section>;
}
