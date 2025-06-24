import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export default function ViewProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const session = await supabase.auth.getSession();
      const user = session.data.session?.user;
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!error) setProfile(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!profile) return <div className="text-center py-10 text-red-500">Profile not found.</div>;

  return (
    <div className="max-w-xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <div><span className="font-semibold">Bio:</span> {profile.bio}</div>
        <div><span className="font-semibold">Skills:</span> {Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills}</div>
        <div><span className="font-semibold">Looking For:</span> {profile.lookingfor}</div>
        <div><span className="font-semibold">Role:</span> {profile.role}</div>
        <div><span className="font-semibold">Plan:</span> {profile.plan}</div>
      </div>
    </div>
  );
}
