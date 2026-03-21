/* ==========================================================
   LMS FULL RESET + RESEED  (v3  –  UID-first approach)
   ==========================================================
   HOW IT WORKS:
   Phase 1  – Create / verify all Firebase Auth accounts.
             Collect the REAL uid for every account.
   Phase 2  – Write Firestore documents keyed by REAL uid.
             Course 'students' arrays use real uids.
             Grades / events / meet-classes use real uids.
   Phase 3  – Clear + rewrite all non-user collections.

   All relationships are hard-coded below; just change the
   ACCOUNTS array to add / remove users.
   ========================================================== */

// ── Account definitions (email→role→name, NOT uid yet) ──────
const ACCOUNTS = [
  // Students
  { key:'s1', name:'Jordan Mitchell',  email:'jordan.m@student.lms.edu',  password:'Demo@1234', role:'student',   grade:10, parentKey:'p1' },
  { key:'s2', name:'Priya Sharma',     email:'priya.s@student.lms.edu',   password:'Demo@1234', role:'student',   grade:11, parentKey:'p2' },
  { key:'s3', name:'Ethan Kowalski',   email:'ethan.k@student.lms.edu',   password:'Demo@1234', role:'student',   grade:10, parentKey:'p1' },
  { key:'s4', name:'Aisha Okonkwo',    email:'aisha.o@student.lms.edu',   password:'Demo@1234', role:'student',   grade:12, parentKey:'p3' },
  { key:'s5', name:'Lucas Beaumont',   email:'lucas.b@student.lms.edu',   password:'Demo@1234', role:'student',   grade:11, parentKey:'p2' },
  { key:'s6', name:'Sofia Reyes',      email:'sofia.r@student.lms.edu',   password:'Demo@1234', role:'student',   grade:12, parentKey:'p3' },
  // Professors
  { key:'t1', name:'Dr. Alan Smith',     email:'a.smith@lms.edu',      password:'Demo@1234', role:'professor' },
  { key:'t2', name:'Ms. Sarah Johnson',  email:'s.johnson@lms.edu',    password:'Demo@1234', role:'professor' },
  { key:'t3', name:'Dr. Rina Patel',     email:'r.patel@lms.edu',      password:'Demo@1234', role:'professor' },
  { key:'t4', name:'Mr. James Chen',     email:'j.chen@lms.edu',       password:'Demo@1234', role:'professor' },
  // Parents
  { key:'p1', name:'Robert Mitchell',  email:'r.mitchell@parent.lms.edu', password:'Demo@1234', role:'parent', childKeys:['s1','s3'] },
  { key:'p2', name:'Ananya Sharma',    email:'a.sharma@parent.lms.edu',   password:'Demo@1234', role:'parent', childKeys:['s2','s5'] },
  { key:'p3', name:'Emeka Okonkwo',    email:'e.okonkwo@parent.lms.edu',  password:'Demo@1234', role:'parent', childKeys:['s4','s6'] },
  // Admin
  { key:'a1', name:'Dr. Margaret Osei', email:'admin@lms.edu', password:'Demo@1234', role:'admin' },
];

// ── Course definitions (uses 'teaching' key + 'enrolled' keys) ──
const COURSE_DEFS = [
  { id:'c-math',  title:'Mathematics 101',               teacherKey:'t1', enrolledKeys:['s1','s2','s3','s5'],     category:'Mathematics', duration:'14 Weeks', price:50, rating:4.7, schedule:'Mon/Wed 10:00 AM', nextClass:'Mon 10:00 AM', progress:{s1:62,s2:55,s3:38,s5:70}, description:'Covers algebra, quadratic equations, geometry proofs, and introductory trigonometry for Grade 10 students.', materials:['Chapter PDF Pack','Khan Academy Video Links','Practice Problem Sets','Formula Sheet'] },
  { id:'c-eng',   title:'English Literature 11',          teacherKey:'t2', enrolledKeys:['s1','s4','s6'],          category:'English',     duration:'12 Weeks', price:40, rating:4.5, schedule:'Tue/Thu 2:00 PM',  nextClass:'Tue 2:00 PM',  progress:{s1:45,s4:60,s6:52},     description:'Analytical reading and essay writing through canonical texts: Shakespeare, Austen, and contemporary Canadian fiction.', materials:['Reading List (PDF)','Essay Style Guide (MLA)','Annotation Workbook'] },
  { id:'c-bio',   title:'Biology – Cells & Genetics',     teacherKey:'t3', enrolledKeys:['s2','s3','s5'],          category:'Science',     duration:'14 Weeks', price:55, rating:4.8, schedule:'Wed/Fri 9:00 AM',  nextClass:'Wed 9:00 AM',  progress:{s2:78,s3:45,s5:82},     description:'Deep-dive into cellular biology, mitosis, Mendelian genetics, and introductory genomics.', materials:['Lab Manual','Illustrated Genetics Guide','Virtual Lab Simulations','Quizlet Flashcards'] },
  { id:'c-cs',    title:'Computer Science – Intro to Python', teacherKey:'t4', enrolledKeys:['s1','s3','s4','s6'], category:'Technology',  duration:'16 Weeks', price:60, rating:4.9, schedule:'Thu/Fri 11:00 AM', nextClass:'Thu 11:00 AM', progress:{s1:38,s3:55,s4:42,s6:65},description:'Foundations of programming using Python: variables, loops, functions, data structures, and a final capstone project.', materials:['Python 3 Tutorial (Book)','Jupyter Notebooks','LeetCode Practice Set','Capstone Project Spec'] },
  { id:'c-hist',  title:'World History – Modern Era',     teacherKey:'t2', enrolledKeys:['s2','s4','s5','s6'],   category:'History',     duration:'10 Weeks', price:35, rating:4.4, schedule:'Mon/Thu 1:00 PM',  nextClass:'Mon 1:00 PM',  progress:{s2:55,s4:48,s5:62,s6:70},description:'Explores geopolitical history from WWI through the Cold War, decolonisation, and the digital revolution.', materials:['Timeline Poster Pack','Primary Source Documents','Documentary Watch List'] },
  { id:'c-phys',  title:'Physics – Mechanics & Waves',    teacherKey:'t1', enrolledKeys:['s1','s3','s6'],          category:'Science',     duration:'12 Weeks', price:50, rating:4.6, schedule:'Tue/Fri 10:00 AM', nextClass:'Tue 10:00 AM', progress:{s1:30,s3:28,s6:40},     description:'Newtonian mechanics, momentum, energy conservation, waves, and sound for Grade 11–12 students.', materials:['Formula Reference Sheet','Virtual Lab (PhET)','Worked Examples PDF'] },
  { id:'c-chem',  title:'Chemistry – Reactions & Stoichiometry', teacherKey:'t3', enrolledKeys:['s2','s4','s5'], category:'Science',     duration:'10 Weeks', price:45, rating:4.5, schedule:'Mon/Wed 3:00 PM',  nextClass:'Mon 3:00 PM',  progress:{s2:48,s4:55,s5:40},     description:'Covers atomic structure, periodic trends, balancing equations, stoichiometry, and solution chemistry.', materials:['Periodic Table (Laminated)','Practice Problems Pack','Lab Safety Manual'] },
  { id:'c-art',   title:'Visual Arts & Design Thinking',  teacherKey:'t2', enrolledKeys:['s4','s5','s6'],          category:'Arts',        duration:'8 Weeks',  price:30, rating:4.3, schedule:'Wed 2:00 PM',      nextClass:'Wed 2:00 PM',  progress:{s4:70,s5:65,s6:80},     description:'Introduces elements of design, colour theory, typography, and digital art tools (Figma, Canva).', materials:['Design Thinking Workbook','Figma Starter Kit','Inspiration Moodboard Pack'] },
];

// ── Events (courseId references c-math, c-cs, etc.)  ──
const EVENT_DEFS = [
  { date:'2026-03-24', title:'Math: Quadratics Assignment Due',        type:'assignment', time:'11:59 PM', courseId:'c-math' },
  { date:'2026-03-25', title:'CS: Python Functions – Google Meet',      type:'class',      time:'11:00 AM', courseId:'c-cs'   },
  { date:'2026-03-26', title:'Biology: Genetics Quiz',                   type:'quiz',       time:'9:00 AM',  courseId:'c-bio'  },
  { date:'2026-03-27', title:'Physics: Newton\'s Laws Lab Report Due',   type:'assignment', time:'5:00 PM',  courseId:'c-phys' },
  { date:'2026-03-28', title:'History: Cold War Essay Submission',       type:'assignment', time:'11:59 PM', courseId:'c-hist' },
  { date:'2026-03-31', title:'English: Gatsby Discussion – Google Meet', type:'class',      time:'2:00 PM',  courseId:'c-eng'  },
  { date:'2026-04-01', title:'Math: Trigonometry Quiz',                  type:'quiz',       time:'10:00 AM', courseId:'c-math' },
  { date:'2026-04-03', title:'Chemistry: Stoichiometry Midterm',         type:'exam',       time:'3:00 PM',  courseId:'c-chem' },
  { date:'2026-04-07', title:'CS: Capstone Project Milestone 1',         type:'assignment', time:'11:59 PM', courseId:'c-cs'   },
  { date:'2026-04-10', title:'Biology: Mitosis Exam',                    type:'exam',       time:'9:00 AM',  courseId:'c-bio'  },
  { date:'2026-04-14', title:'Physics: Waves & Sound Quiz',              type:'quiz',       time:'10:00 AM', courseId:'c-phys' },
  { date:'2026-04-16', title:'Art: Design Portfolio Due',                type:'assignment', time:'6:00 PM',  courseId:'c-art'  },
];

// ── Meet Class defs (use courseId + teacherKey) ──
const MEET_DEFS = [
  { id:'m1', title:'Python Intro: Functions & Scope',      courseId:'c-cs',   teacherKey:'t4', date:'2026-03-25', time:'11:00 AM', duration:'75 min', meetLink:'https://meet.google.com/abc-defg-hij', status:'upcoming', recordingLink:null },
  { id:'m2', title:'Gatsby Ch. 4–6 Discussion',            courseId:'c-eng',  teacherKey:'t2', date:'2026-03-31', time:'2:00 PM',  duration:'60 min', meetLink:'https://meet.google.com/klm-nopq-rst', status:'upcoming', recordingLink:null },
  { id:'m3', title:'Genetics & Punnett Squares Review',    courseId:'c-bio',  teacherKey:'t3', date:'2026-04-01', time:'9:00 AM',  duration:'60 min', meetLink:'https://meet.google.com/uvw-xyz1-234', status:'upcoming', recordingLink:null },
  { id:'m4', title:'Quadratics & Factoring Masterclass',   courseId:'c-math', teacherKey:'t1', date:'2026-04-06', time:'10:00 AM', duration:'90 min', meetLink:'https://meet.google.com/567-890a-bcd', status:'upcoming', recordingLink:null },
  { id:'m5', title:"Newton's Laws Worked Examples",        courseId:'c-phys', teacherKey:'t1', date:'2026-03-14', time:'10:00 AM', duration:'65 min', meetLink:'https://meet.google.com/efa-bce-fgh', status:'past',     recordingLink:'https://drive.google.com/file/d/demo-rec-1' },
  { id:'m6', title:'Python: Lists, Dicts & Loops',         courseId:'c-cs',   teacherKey:'t4', date:'2026-03-18', time:'11:00 AM', duration:'80 min', meetLink:'https://meet.google.com/ijk-lmno-pqr', status:'past',     recordingLink:'https://drive.google.com/file/d/demo-rec-2' },
  { id:'m7', title:'Shakespeare: Tragedy & Structure',     courseId:'c-eng',  teacherKey:'t2', date:'2026-03-17', time:'2:00 PM',  duration:'55 min', meetLink:'https://meet.google.com/stu-vwxy-z01', status:'past',     recordingLink:'https://drive.google.com/file/d/demo-rec-3' },
];

// ── Grade templates (uses studentKey + courseId) ──
const GRADE_DEFS = [
  { sKey:'s1', courseId:'c-math', courseTitle:'Mathematics 101',               assignment:'Algebra Quiz 1',         score:87, grade:'A',  date:'2026-02-14' },
  { sKey:'s1', courseId:'c-math', courseTitle:'Mathematics 101',               assignment:'Geometry Test',          score:91, grade:'A',  date:'2026-03-01' },
  { sKey:'s1', courseId:'c-eng',  courseTitle:'English Literature 11',         assignment:'Hamlet Essay',           score:78, grade:'B',  date:'2026-02-20' },
  { sKey:'s1', courseId:'c-cs',   courseTitle:'CS – Intro to Python',          assignment:'Python Loops Lab',       score:95, grade:'A+', date:'2026-03-08' },
  { sKey:'s1', courseId:'c-phys', courseTitle:'Physics – Mechanics & Waves',   assignment:'Kinematics Problem Set', score:72, grade:'B',  date:'2026-03-05' },
  { sKey:'s2', courseId:'c-math', courseTitle:'Mathematics 101',               assignment:'Algebra Quiz 1',         score:82, grade:'A',  date:'2026-02-14' },
  { sKey:'s2', courseId:'c-bio',  courseTitle:'Biology – Cells & Genetics',    assignment:'Cell Structure Quiz',    score:90, grade:'A',  date:'2026-02-18' },
  { sKey:'s2', courseId:'c-hist', courseTitle:'World History – Modern Era',    assignment:'WWI Essay',              score:85, grade:'A',  date:'2026-03-10' },
  { sKey:'s2', courseId:'c-chem', courseTitle:'Chemistry – Reactions',         assignment:'Stoichiometry Quiz',     score:79, grade:'B',  date:'2026-03-15' },
  { sKey:'s3', courseId:'c-math', courseTitle:'Mathematics 101',               assignment:'Algebra Quiz 1',         score:74, grade:'B',  date:'2026-02-14' },
  { sKey:'s3', courseId:'c-cs',   courseTitle:'CS – Intro to Python',          assignment:'Python Loops Lab',       score:88, grade:'A',  date:'2026-03-08' },
  { sKey:'s3', courseId:'c-phys', courseTitle:'Physics – Mechanics & Waves',   assignment:'Kinematics Problem Set', score:68, grade:'C',  date:'2026-03-05' },
  { sKey:'s4', courseId:'c-eng',  courseTitle:'English Literature 11',         assignment:'Hamlet Essay',           score:83, grade:'A',  date:'2026-02-20' },
  { sKey:'s4', courseId:'c-cs',   courseTitle:'CS – Intro to Python',          assignment:'Python Loops Lab',       score:77, grade:'B',  date:'2026-03-08' },
  { sKey:'s4', courseId:'c-hist', courseTitle:'World History – Modern Era',    assignment:'WWI Essay',              score:91, grade:'A',  date:'2026-03-10' },
  { sKey:'s5', courseId:'c-math', courseTitle:'Mathematics 101',               assignment:'Algebra Quiz 1',         score:80, grade:'B',  date:'2026-02-14' },
  { sKey:'s5', courseId:'c-bio',  courseTitle:'Biology – Cells & Genetics',    assignment:'Cell Structure Quiz',    score:93, grade:'A+', date:'2026-02-18' },
  { sKey:'s5', courseId:'c-hist', courseTitle:'World History – Modern Era',    assignment:'WWI Essay',              score:76, grade:'B',  date:'2026-03-10' },
  { sKey:'s6', courseId:'c-eng',  courseTitle:'English Literature 11',         assignment:'Hamlet Essay',           score:89, grade:'A',  date:'2026-02-20' },
  { sKey:'s6', courseId:'c-cs',   courseTitle:'CS – Intro to Python',          assignment:'Python Loops Lab',       score:92, grade:'A',  date:'2026-03-08' },
  { sKey:'s6', courseId:'c-phys', courseTitle:'Physics – Mechanics & Waves',   assignment:'Kinematics Problem Set', score:85, grade:'A',  date:'2026-03-05' },
];

// ── Books ──────────────────────────────────────────────────────
const BOOKS = [
  { id:'book-001', title:'Introduction to Algorithms (CLRS)', author:'Cormen, Leiserson, Rivest, Stein', isbn:'9780262033848', category:'Computer Science',    description:'The definitive reference on algorithms used in universities worldwide.',                            totalCopies:5, availableCopies:3, borrowPrice:8,  buyPrice:45, rating:4.9, coverImage:'https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg' },
  { id:'book-002', title:'Clean Code',                         author:'Robert C. Martin',                 isbn:'9780132350884', category:'Software Engineering', description:'A handbook of agile software craftsmanship — how to write readable, maintainable code.',         totalCopies:4, availableCopies:2, borrowPrice:6,  buyPrice:38, rating:4.8, coverImage:'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg' },
  { id:'book-003', title:'The Great Gatsby',                   author:'F. Scott Fitzgerald',              isbn:'9780743273565', category:'Literature',           description:'The Jazz Age classic exploring wealth, love, and the American Dream.',                            totalCopies:8, availableCopies:6, borrowPrice:3,  buyPrice:12, rating:4.5, coverImage:'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg' },
  { id:'book-004', title:'A Brief History of Time',            author:'Stephen Hawking',                  isbn:'9780553380163', category:'Science',              description:'Hawking makes cosmology — black holes, the Big Bang, time itself — accessible to everyone.',     totalCopies:5, availableCopies:4, borrowPrice:4,  buyPrice:18, rating:4.7, coverImage:'https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg' },
  { id:'book-005', title:'Calculus: Early Transcendentals',    author:'James Stewart',                    isbn:'9781285741550', category:'Mathematics',          description:'The gold standard university calculus textbook — limits, derivatives, integrals, and more.',      totalCopies:6, availableCopies:5, borrowPrice:10, buyPrice:65, rating:4.6, coverImage:'https://covers.openlibrary.org/b/isbn/9781285741550-L.jpg' },
  { id:'book-006', title:'The Selfish Gene',                   author:'Richard Dawkins',                  isbn:'9780198788607', category:'Science',              description:'A landmark work introducing the gene-centred view of evolution.',                                 totalCopies:4, availableCopies:3, borrowPrice:4,  buyPrice:16, rating:4.4, coverImage:'https://covers.openlibrary.org/b/isbn/9780198788607-L.jpg' },
  { id:'book-007', title:'Sapiens: A Brief History of Humankind', author:'Yuval Noah Harari',            isbn:'9780062316097', category:'History',              description:'A sweeping narrative of human history from the Stone Age to the twenty-first century.',         totalCopies:6, availableCopies:4, borrowPrice:5,  buyPrice:20, rating:4.8, coverImage:'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg' },
  { id:'book-008', title:'Automate the Boring Stuff with Python', author:'Al Sweigart',                  isbn:'9781593275990', category:'Computer Science',    description:'Learn Python by automating practical tasks: files, PDFs, spreadsheets, and the web.',           totalCopies:5, availableCopies:5, borrowPrice:5,  buyPrice:30, rating:4.7, coverImage:'https://covers.openlibrary.org/b/isbn/9781593275990-L.jpg' },
  { id:'book-009', title:'Chemistry: The Central Science',     author:'Brown, LeMay, Bursten',            isbn:'9780134414232', category:'Science',              description:'A trusted text integrating conceptual understanding with real-world applications.',               totalCopies:5, availableCopies:3, borrowPrice:9,  buyPrice:55, rating:4.5, coverImage:'https://covers.openlibrary.org/b/isbn/9780134414232-L.jpg' },
  { id:'book-010', title:'To Kill a Mockingbird',              author:'Harper Lee',                       isbn:'9780061935466', category:'Literature',           description:"Pulitzer Prize–winning masterwork of honour and injustice through a child's eyes.",              totalCopies:7, availableCopies:5, borrowPrice:3,  buyPrice:13, rating:4.8, coverImage:'https://covers.openlibrary.org/b/isbn/9780061935466-L.jpg' },
  { id:'book-011', title:'The Design of Everyday Things',      author:'Don Norman',                       isbn:'9780465050659', category:'Arts',                 description:'A fascinating investigation into how design shapes the world and makes products intuitive.',     totalCopies:3, availableCopies:2, borrowPrice:5,  buyPrice:25, rating:4.6, coverImage:'https://covers.openlibrary.org/b/isbn/9780465050659-L.jpg' },
  { id:'book-012', title:'Physics for Scientists and Engineers', author:'Raymond Serway',                 isbn:'9781337553292', category:'Science',              description:'Comprehensive treatment of classical and modern physics with emphasis on problem-solving.',       totalCopies:5, availableCopies:4, borrowPrice:10, buyPrice:60, rating:4.5, coverImage:'https://covers.openlibrary.org/b/isbn/9781337553292-L.jpg' },
];

// ==========================================================
//   SEED RUNNER
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('seed-btn').addEventListener('click', runSeed);
});

async function runSeed() {
  const btn = document.getElementById('seed-btn');
  btn.disabled = true;
  const L = (msg, type='info') => {
    const el = document.createElement('div');
    el.className = `log-entry ${type}`;
    el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    const out = document.getElementById('log-output');
    out.appendChild(el);
    out.scrollTop = out.scrollHeight;
    console.log(msg);
  };

  if (!firebaseReady) { L('❌ Firebase not initialized!','error'); btn.disabled=false; return; }

  try {

    // ════════════════════════════════════════
    //  PHASE 0 — CLEAR EXISTING COLLECTIONS
    // ════════════════════════════════════════
    L('🗑️  Clearing old collections…');
    const toClear = ['courses','events','grades','meetClasses','books','contacts','users'];
    for (const coll of toClear) {
      const snap = await db.collection(coll).get();
      const batch = db.batch();
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      L(`  ✅ Cleared ${coll} (${snap.size} docs)`, 'success');
    }

    // ════════════════════════════════════════
    //  PHASE 1 — CREATE AUTH + MAP KEYS→UIDS
    // ════════════════════════════════════════
    L('🔐 Phase 1: Auth account creation…');
    const keyToUid = {};   // eg { s1: 'firebaseUid123', p1: 'firebaseUid456' }

    for (const acc of ACCOUNTS) {
      let uid;
      try {
        const cred = await auth.createUserWithEmailAndPassword(acc.email, acc.password);
        uid = cred.user.uid;
        await cred.user.updateProfile({ displayName: acc.name });
        await auth.signOut();          // sign out so next createUserWithEmailAndPassword works
        L(`  ✅ Created Auth: ${acc.email}  uid=${uid}`, 'success');
      } catch(err) {
        if (err.code === 'auth/email-already-in-use') {
          // sign in to get the uid
          try {
            const cred2 = await auth.signInWithEmailAndPassword(acc.email, acc.password);
            uid = cred2.user.uid;
            await auth.signOut();
            L(`  ⚠️  ${acc.email} existed — uid=${uid}`, 'warning');
          } catch(e2) {
            L(`  ❌ Cannot get uid for ${acc.email}: ${e2.message}`, 'error');
            continue;
          }
        } else {
          L(`  ❌ Auth error for ${acc.email}: ${err.message}`, 'error');
          continue;
        }
      }
      keyToUid[acc.key] = uid;
    }

    L(`📝 UID map built for ${Object.keys(keyToUid).length} accounts`, 'info');

    // ════════════════════════════════════════
    //  PHASE 2 — WRITE USER PROFILE DOCS
    // ════════════════════════════════════════
    L('👤 Phase 2: Writing user profile documents…');
    for (const acc of ACCOUNTS) {
      const uid = keyToUid[acc.key];
      if (!uid) continue;

      const doc = {
        name:   acc.name,
        email:  acc.email,
        role:   acc.role,
        status: 'active',
      };

      if (acc.role === 'student') {
        doc.grade    = acc.grade;
        doc.parentId = keyToUid[acc.parentKey] || '';
      }

      if (acc.role === 'parent') {
        doc.linkedStudents = (acc.childKeys || []).map(k => keyToUid[k]).filter(Boolean);
      }

      if (acc.role === 'professor') {
        const teachingCourses = COURSE_DEFS.filter(c => c.teacherKey === acc.key).map(c => c.id);
        doc.teachingCourses = teachingCourses;
      }

      await db.collection('users').doc(uid).set(doc);
      L(`  ✅ User doc: ${acc.name} (${acc.role}) → users/${uid}`, 'success');
    }

    // ════════════════════════════════════════
    //  PHASE 3 — WRITE COURSES
    // ════════════════════════════════════════
    L('📚 Phase 3: Writing courses…');
    for (const c of COURSE_DEFS) {
      const studentUids  = (c.enrolledKeys || []).map(k => keyToUid[k]).filter(Boolean);
      const teacherUid   = keyToUid[c.teacherKey] || '';
      const teacherName  = ACCOUNTS.find(a => a.key === c.teacherKey)?.name || '';

      // Build per-student progress array
      const progressMap = {};
      for (const [sKey, val] of Object.entries(c.progress || {})) {
        const sUid = keyToUid[sKey];
        if (sUid) progressMap[sUid] = val;
      }

      await db.collection('courses').doc(c.id).set({
        title:        c.title,
        category:     c.category,
        duration:     c.duration,
        price:        c.price,
        rating:       c.rating,
        schedule:     c.schedule,
        nextClass:    c.nextClass,
        description:  c.description,
        materials:    c.materials,
        instructorId:   teacherUid,
        instructorName: teacherName,
        students:     studentUids,   // ← real Firebase uids
        progress:     progressMap,   // { uid: number }
        // keep a flat progress for legacy (per-student dashboards override this)
        progressDefault: 50,
      });
      L(`  ✅ Course: ${c.title} — ${studentUids.length} students`, 'success');
    }

    // ════════════════════════════════════════
    //  PHASE 4 — WRITE EVENTS
    // ════════════════════════════════════════
    L('📅 Phase 4: Writing events…');
    for (const e of EVENT_DEFS) {
      await db.collection('events').add(e);
    }
    L(`  ✅ ${EVENT_DEFS.length} events written`, 'success');

    // ════════════════════════════════════════
    //  PHASE 5 — WRITE MEET CLASSES
    // ════════════════════════════════════════
    L('🎥 Phase 5: Writing Google Meet sessions…');
    for (const m of MEET_DEFS) {
      const teacherName = ACCOUNTS.find(a => a.key === m.teacherKey)?.name || '';
      const course      = COURSE_DEFS.find(c => c.id === m.courseId);
      await db.collection('meetClasses').doc(m.id).set({
        ...m,
        instructor:   teacherName,
        instructorId: keyToUid[m.teacherKey] || '',
        course:       course?.title || '',
      });
    }
    L(`  ✅ ${MEET_DEFS.length} meet sessions written`, 'success');

    // ════════════════════════════════════════
    //  PHASE 6 — WRITE GRADES
    // ════════════════════════════════════════
    L('📊 Phase 6: Writing grades…');
    for (const g of GRADE_DEFS) {
      const studentUid = keyToUid[g.sKey];
      if (!studentUid) continue;
      await db.collection('grades').add({
        studentId:   studentUid,
        courseId:    g.courseId,
        courseTitle: g.courseTitle,
        assignment:  g.assignment,
        score:       g.score,
        grade:       g.grade,
        date:        g.date,
      });
    }
    L(`  ✅ ${GRADE_DEFS.length} grade records written`, 'success');

    // ════════════════════════════════════════
    //  PHASE 7 — WRITE BOOKS
    // ════════════════════════════════════════
    L('📖 Phase 7: Writing books…');
    for (const b of BOOKS) {
      await db.collection('books').doc(b.id).set(b);
    }
    L(`  ✅ ${BOOKS.length} books written`, 'success');

    // ════════════════════════════════════════
    //  PHASE 8 — WRITE CONTACTS DIRECTORY
    // ════════════════════════════════════════
    L('👥 Phase 8: Writing contacts directory…');
    for (const acc of ACCOUNTS) {
      const uid = keyToUid[acc.key];
      if (!uid) continue;
      const initials = acc.name.split(' ').map(n => n[0]).join('');
      await db.collection('contacts').doc(uid).set({
        name:    acc.name,
        email:   acc.email,
        role:    acc.role,
        avatar:  initials,
        online:  ['t1','t2','t4','s1','s3'].includes(acc.key),
      });
    }
    L('  ✅ Contacts directory written', 'success');

    // ════════════════════════════════════════
    //  DONE — PRINT CREDENTIAL SUMMARY
    // ════════════════════════════════════════
    L('');
    L('🎉 ══════════════════════════════════════════', 'success');
    L('   DATABASE RESET & SEED COMPLETE!',           'success');
    L('   All accounts linked with real Firebase UIDs.', 'success');
    L('');
    // Print per-account summary
    for (const acc of ACCOUNTS) {
      const uid = keyToUid[acc.key] || '(failed)';
      L(`   ${acc.role.padEnd(9)} │ ${acc.email.padEnd(38)} │ Demo@1234 │ uid: ${uid}`, 'success');
    }
    L('🎉 ══════════════════════════════════════════', 'success');

    // Store uid map to localStorage for credentials page
    localStorage.setItem('lms-seed-uid-map', JSON.stringify(keyToUid));

  } catch(e) {
    L(`💥 FATAL: ${e.message}`, 'error');
    console.error(e);
  } finally {
    btn.disabled = false;
  }
}
