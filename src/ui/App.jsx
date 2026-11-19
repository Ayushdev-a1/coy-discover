import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Heart, Home, MapPin, ShieldCheck, Sparkles, Users, X } from 'lucide-react';

const getJson = async (url, options) => {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not reach Coy. Try again in a moment.');
  return data;
};

function Brand() {
  return <div className="brand" aria-label="Coy"><span>coy</span><i /></div>;
}

function Navigation({ page, onNavigate, matchCount }) {
  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Discover', icon: Sparkles },
    { id: 'matches', label: 'Matches', icon: Heart },
  ];
  return <>
    <aside className="sidebar">
      <Brand />
      <p className="sidebar-label">YOUR SPACE</p>
      <nav aria-label="Main navigation">
        {items.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => onNavigate(id)}>
          <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
          {id === 'matches' && matchCount > 0 && <span className="nav-count">{matchCount}</span>}
        </button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="promise-icon"><Heart size={16} fill="currentColor" /></div>
        <p>Your likes stay private.<br /><strong>Until they like you back.</strong></p>
      </div>
    </aside>
    <nav className="mobile-nav" aria-label="Main navigation">
      {items.map(({ id, label, icon: Icon }) => <button key={id} className={`mobile-nav-item ${page === id ? 'active' : ''}`} onClick={() => onNavigate(id)}>
        <span className="mobile-icon-wrap"><Icon size={20} strokeWidth={1.9} />{id === 'matches' && matchCount > 0 && <i />}</span><span>{label}</span>
      </button>)}
    </nav>
  </>;
}

function HomeView({ onDiscover, onMatches, feedCount, matchCount }) {
  return <section className="home-page">
    <div className="home-hero">
      <div className="home-hero-copy">
        <p className="eyebrow">YOUR COY SPACE</p>
        <h1>A little curiosity<br />goes a long way.</h1>
        <p className="home-lede">Take a look around. Every like stays yours until it’s mutual.</p>
        <div className="home-actions">
          <button className="primary-button" onClick={onDiscover}><Sparkles size={16} /> Start discovering <ArrowRight size={16} /></button>
          <button className="home-text-button" onClick={onMatches}>See your matches <ChevronRight size={15} /></button>
        </div>
      </div>
      <div className="home-art" aria-hidden="true">
        <div className="home-orbit orbit-outer" /><div className="home-orbit orbit-inner" />
        <div className="home-art-heart"><Heart size={34} fill="currentColor" strokeWidth={1.4} /></div>
        <span className="home-art-spark spark-left">✳</span><span className="home-art-spark spark-right">✳</span>
        <div className="home-art-caption"><span>good things</span><strong>take a little time</strong></div>
      </div>
    </div>
    <div className="home-stats" aria-label="Your discovery summary">
      <div className="home-stat"><span className="home-stat-icon"><Users size={17} /></span><div><strong>{feedCount}</strong><span>people to meet</span></div></div>
      <div className="home-stat"><span className="home-stat-icon coral"><Heart size={17} /></span><div><strong>{matchCount}</strong><span>mutual {matchCount === 1 ? 'match' : 'matches'}</span></div></div>
      <div className="home-stat privacy-stat"><span className="home-stat-icon green"><ShieldCheck size={17} /></span><div><strong>Private</strong><span>until it’s mutual</span></div></div>
    </div>
    <div className="home-how">
      <div className="home-how-heading"><div><p className="eyebrow">SIMPLE, BY DESIGN</p><h2>Good connections start small.</h2></div><span>01 — 03</span></div>
      <div className="home-steps">
        <article className="home-step"><span>01</span><h3>Take a look around</h3><p>Meet people nearby, one profile at a time.</p></article>
        <article className="home-step"><span>02</span><h3>Follow your curiosity</h3><p>Like someone when it feels right. No pressure either way.</p></article>
        <article className="home-step"><span>03</span><h3>It only takes two</h3><p>We’ll let you know if the feeling comes back.</p></article>
      </div>
    </div>
  </section>;
}

function ProfileCard({ profile, onSwipe, isTop, animation, swipeHandlers }) {
  if (!profile) return null;
  const dragX = swipeHandlers?.offset?.x || 0;
  return <article
    className={`profile-card ${isTop ? 'top-card' : 'under-card'} ${isTop && dragX > 30 ? 'drag-like' : ''} ${isTop && dragX < -30 ? 'drag-pass' : ''} ${animation || ''}`}
    tabIndex={isTop ? 0 : undefined}
    aria-label={isTop ? `${profile.name}, ${profile.age}. Use left and right arrow keys to pass or like.` : undefined}
    onPointerDown={isTop ? swipeHandlers.onPointerDown : undefined}
    onPointerMove={isTop ? swipeHandlers.onPointerMove : undefined}
    onPointerUp={isTop ? swipeHandlers.onPointerUp : undefined}
    onPointerCancel={isTop ? swipeHandlers.onPointerCancel : undefined}
    onKeyDown={isTop ? (event) => {
      if (event.target.closest('button')) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); onSwipe('pass'); }
      if (event.key === 'ArrowRight') { event.preventDefault(); onSwipe('like'); }
    } : undefined}
    style={isTop && swipeHandlers.offset ? { '--drag-x': `${swipeHandlers.offset.x}px`, '--drag-y': `${swipeHandlers.offset.y}px`, '--drag-rotate': `${swipeHandlers.offset.x / 18}deg` } : undefined}
  >
    <div className="card-photo-wrap">
      <img className="card-photo" src={profile.photo} alt={`${profile.name}`} draggable="false" />
      <div className="photo-shade" />
      {isTop && <>
        <div className="gesture-label like-label">LIKE</div>
        <div className="gesture-label pass-label">PASS</div>
        <div className="photo-topline"><span className="online-dot" /> Around your corner</div>
      </>}
      <div className="profile-intro"><h2>{profile.name}<span>, {profile.age}</span></h2><p><MapPin size={14} fill="currentColor" />{profile.city}</p></div>
    </div>
    <div className="card-details">
      <p className="bio">{profile.bio}</p>
      <div className="interest-list">{profile.interests.map((interest) => <span key={interest}>{interest}</span>)}</div>
      {isTop && <div className="card-actions" aria-label="Choose whether to like this profile">
        <button className="action-button pass-button" aria-label="Pass" onClick={() => onSwipe('pass')}><X size={22} strokeWidth={2.2} /></button>
        <p>Not your person? Keep moving.</p>
        <button className="action-button like-button" aria-label="Like" onClick={() => onSwipe('like')}><Heart size={21} strokeWidth={2.1} /></button>
      </div>}
    </div>
  </article>;
}

function EmptyState() {
  return <div className="empty-state">
    <div className="empty-illustration"><span className="sun-orbit orbit-one" /><span className="sun-orbit orbit-two" /><div className="empty-heart"><Heart size={38} strokeWidth={1.5} /></div><span className="spark spark-a">✳</span><span className="spark spark-b">✳</span></div>
    <p className="eyebrow">THAT'S EVERYONE FOR NOW</p>
    <h2>You made it<br />through the list.</h2>
    <p className="empty-copy">Good things take their time. Check back later and see who’s new around here.</p>
  </div>;
}

function MatchOverlay({ profile, onClose }) {
  if (!profile) return null;
  return <div className="modal-backdrop" role="presentation" onClick={onClose}>
    <section className="match-modal" role="dialog" aria-modal="true" aria-labelledby="match-title" onClick={(event) => event.stopPropagation()}>
      <button className="modal-close" onClick={onClose} aria-label="Close match"><X size={19} /></button>
      <div className="match-sparkle"><Sparkles size={18} /></div>
      <p className="eyebrow">WELL, LOOK AT THAT</p>
      <h2 id="match-title">You like each other.</h2>
      <p className="match-subtitle">A little curiosity, from both sides.</p>
      <div className="match-portrait-wrap"><img src={profile.photo} alt={profile.name} /><span><Heart size={19} fill="currentColor" /></span></div>
      <h3>{profile.name}, {profile.age}</h3>
      <p className="match-city"><MapPin size={14} /> {profile.city}</p>
      <button className="match-done" onClick={onClose}>Keep discovering <ArrowRight size={17} /></button>
      <p className="match-note"><Check size={13} /> Only mutual matches are shown. Other likes stay private.</p>
    </section>
  </div>;
}

function MatchesView({ matches, loading, error, onRetry, onDiscover }) {
  if (loading) return <div className="view-loading"><span className="loader" />Getting your matches…</div>;
  if (error) return <div className="matches-empty"><div className="empty-heart small"><Heart size={26} /></div><h2>Couldn’t load matches.</h2><p>{error}</p><button className="primary-button" onClick={onRetry}>Try again</button></div>;
  if (!matches.length) return <div className="matches-empty"><div className="empty-heart small"><Heart size={26} /></div><p className="eyebrow">GOOD THINGS TAKE TWO</p><h2>Your matches will show up here.</h2><p>When you both say yes, we’ll bring you together. Until then, your likes are yours alone.</p><button className="primary-button" onClick={onDiscover}>Back to Discover <ArrowRight size={17} /></button></div>;
  return <div className="matches-list">{matches.map((match) => <article className="match-row" key={match.id}>
    <img src={match.photo} alt="" /><div className="match-row-copy"><h3>{match.name}, {match.age}</h3><p><MapPin size={13} /> {match.city}</p></div><span className="mutual-chip"><Heart size={13} fill="currentColor" /> Mutual</span>
  </article>)}</div>;
}

function App() {
  const [page, setPage] = useState('discover');
  const [feed, setFeed] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchError, setMatchError] = useState('');
  const [activeMatch, setActiveMatch] = useState(null);
  const [animation, setAnimation] = useState('');
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointerStart = useRef(null);
  const busyRef = useRef(false);
  const topProfile = feed[0];
  const nextProfile = feed[1];

  const loadFeed = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await getJson('/feed'); setFeed(data.profiles); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  const loadMatches = useCallback(async () => {
    setMatchLoading(true); setMatchError('');
    try { const data = await getJson('/matches'); setMatches(data.matches); }
    catch (err) { setMatchError(err.message); }
    finally { setMatchLoading(false); }
  }, []);

  useEffect(() => { loadFeed(); loadMatches(); }, [loadFeed, loadMatches]);

  const swipe = useCallback(async (direction) => {
    if (!topProfile || busyRef.current) return;
    busyRef.current = true; setAnimation(direction === 'like' ? 'fly-right' : 'fly-left');
    try {
      const result = await getJson('/swipe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profileId: topProfile.id, direction }) });
      setFeed((current) => current.filter(({ id }) => id !== topProfile.id));
      setAnimation(''); setOffset({ x: 0, y: 0 });
      if (result.match) { setMatches((current) => current.some(({ id }) => id === result.match.id) ? current : [result.match, ...current]); setActiveMatch(result.match); }
    } catch (err) {
      setAnimation(''); setOffset({ x: 0, y: 0 }); setError(err.message);
      await loadFeed();
    } finally { busyRef.current = false; }
  }, [topProfile, loadFeed]);

  const pointerHandlers = useMemo(() => ({
    offset,
    onPointerDown: (event) => {
      if (event.target.closest('button') || (event.pointerType === 'mouse' && event.button !== 0)) return;
      pointerStart.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event) => { if (pointerStart.current) setOffset({ x: event.clientX - pointerStart.current.x, y: event.clientY - pointerStart.current.y }); },
    onPointerUp: (event) => {
      if (!pointerStart.current) return;
      const dx = event.clientX - pointerStart.current.x;
      const dy = event.clientY - pointerStart.current.y;
      pointerStart.current = null;
      const threshold = Math.max(85, Math.min(135, event.currentTarget.clientWidth * 0.22));
      if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 1.1) swipe(dx > 0 ? 'like' : 'pass');
      else setOffset({ x: 0, y: 0 });
    },
    onPointerCancel: () => { pointerStart.current = null; setOffset({ x: 0, y: 0 }); },
  }), [offset, swipe]);

  const refreshMatches = useCallback(() => loadMatches(), [loadMatches]);

  return <div className="app-shell">
    <Navigation page={page} onNavigate={(next) => { setPage(next); if (next === 'matches') refreshMatches(); }} matchCount={matches.length} />
    <main className="main-content">
      <header className="topbar"><div className="topbar-mobile-brand"><Brand /></div><div className="topbar-kicker"><span className="status-dot" /> A little closer to your corner of the world</div><button className="profile-pill" aria-label="Your profile"><span>AA</span></button></header>
      {page === 'home' ? <HomeView onDiscover={() => setPage('discover')} onMatches={() => { setPage('matches'); refreshMatches(); }} feedCount={loading ? '—' : feed.length} matchCount={matches.length} /> : page === 'discover' ? <section className="discover-page">
        <div className="discover-heading"><div><p className="eyebrow">A GOOD PLACE TO START</p><h1>People, a little<br className="mobile-break" /> closer.</h1><p className="intro-copy">No rush. See who you’re curious about.</p></div><div className="feed-count"><span>{loading ? '—' : feed.length}</span><small>left to meet</small></div></div>
        {error && !loading && <div className="error-banner" role="alert"><span>{error}</span><button onClick={loadFeed}>Retry</button></div>}
        <div className="discovery-layout">
          <div className="deck-column">
            <div className="deck-wrap">
              {loading ? <div className="skeleton-card"><span className="loader" /><p>Finding your people…</p></div> : topProfile ? <>
                {nextProfile && <ProfileCard profile={nextProfile} isTop={false} />}
                <ProfileCard key={topProfile.id} profile={topProfile} isTop animation={animation} swipeHandlers={pointerHandlers} onSwipe={swipe} />
              </> : error ? null : <EmptyState />}
            </div>
            {topProfile && <p className="swipe-hint"><ArrowLeft size={14} /><span>Drag the card, use arrow keys, or pick a side</span><ArrowRight size={14} /></p>}
          </div>
          <aside className="side-note">
            <div className="note-mark"><Heart size={16} fill="currentColor" /></div>
            <p className="eyebrow">A COY KIND OF PROMISE</p>
            <h2>Your interest<br />stays yours.</h2>
            <p>We’ll only let you know when the feeling is mutual. No secret admirers list, no awkward guessing.</p>
            <button className="text-link" onClick={() => setPage('matches')}>See your matches <ChevronRight size={15} /></button>
            <div className="note-footer"><span className="note-line" /><span>Take it at your pace</span></div>
          </aside>
        </div>
      </section> : <section className="matches-page">
        <div className="matches-heading"><div><p className="eyebrow">THE FEELING IS MUTUAL</p><h1>Your matches<span className="match-heading-count">{matches.length}</span></h1><p className="intro-copy">A good start to a conversation.</p></div><div className="matches-heading-icon"><Heart size={22} /></div></div>
        <MatchesView matches={matches} loading={matchLoading} error={matchError} onRetry={loadMatches} onDiscover={() => setPage('discover')} />
      </section>}
      <footer className="page-footer"><span>© Coy · For the curious</span><span>Made for mutual feelings <Heart size={11} fill="currentColor" /></span></footer>
    </main>
    <MatchOverlay profile={activeMatch} onClose={() => setActiveMatch(null)} />
  </div>;
}

export default App;

