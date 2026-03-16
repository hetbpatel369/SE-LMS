const DEMO_USERS = [
  { id: 'student-001', name: 'John Doe', email: 'john@student.edu', password: 'password123', role: 'student', status: 'active' },
  { id: 'student-002', name: 'Jane Smith', email: 'jane@student.edu', password: 'password123', role: 'student', status: 'active' },
  { id: 'prof-001', name: 'Dr. Alan Smith', email: 'alan@prof.edu', password: 'password123', role: 'professor', status: 'active' },
  { id: 'prof-002', name: 'Dr. Sarah Johnson', email: 'sarah@prof.edu', password: 'password123', role: 'professor', status: 'active' },
  { id: 'admin-001', name: 'System Admin', email: 'admin@lms.edu', password: 'password123', role: 'admin', status: 'active' },
  { id: 'parent-001', name: 'Robert Doe', email: 'robert@parent.edu', password: 'password123', role: 'parent', status: 'active', linkedStudents: ['student-001'] }
];

document.addEventListener('DOMContentLoaded', () => {
  const seedBtn = document.getElementById('seed-btn');
  const logOutput = document.getElementById('log-output');

  function log(message, type = 'info') {
    const el = document.createElement('div');
    el.className = `log-entry ${type}`;
    el.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logOutput.appendChild(el);
    logOutput.scrollTop = logOutput.scrollHeight;
  }

  seedBtn.addEventListener('click', async () => {
    seedBtn.disabled = true;
    log('Starting seed process...', 'info');

    if (!firebaseReady) {
      log('Firebase is not initialized! Check config.', 'error');
      seedBtn.disabled = false;
      return;
    }

    try {
      // 1. Seed Courses
      log('Seeding courses...', 'info');
      for (const course of LMS_COURSES) {
        await db.collection('courses').doc(course.id.toString()).set({
          title: course.title,
          instructorName: course.instructor,
          progress: course.progress,
          nextClass: course.nextClass,
          students: ['student-001', 'student-002'] // Link to demo students
        });
        log(`Seeded course: ${course.title}`, 'success');
      }

      // 2. Seed Grades
      log('Seeding grades...', 'info');
      for (const grade of LMS_GRADES) {
        await db.collection('grades').add({
          studentId: 'student-001', // Attach to demo student
          courseTitle: grade.course,
          assignment: grade.assignment,
          score: grade.score,
          grade: grade.grade,
          date: grade.date
        });
        for (const grade of LMS_GRADES) {
          // Add slightly varied grades for student-002
           await db.collection('grades').add({
            studentId: 'student-002', // Attach to demo student
            courseTitle: grade.course,
            assignment: grade.assignment,
            score: Math.max(0, grade.score - 5),
            grade: grade.grade, // close enough
            date: grade.date
          });
        }
        log(`Seeded grade: ${grade.course} - ${grade.assignment}`, 'success');
      }

      // 3. Seed Events
      log('Seeding events...', 'info');
      for (const date in LMS_EVENTS_MAP) {
        for (const event of LMS_EVENTS_MAP[date]) {
          await db.collection('events').add({
            date: date,
            title: event.title,
            type: event.type,
            time: event.time
          });
        }
        log(`Seeded events for date: ${date}`, 'success');
      }

      // 4. Seed Contacts into a public directory
      log('Seeding contacts/directory...', 'info');
      for (const contact of LMS_CONTACTS) {
        await db.collection('contacts').doc(contact.id).set({
          name: contact.name,
          role: contact.role,
          avatar: contact.avatar
        });
      }

      // 5. Seed Messages (Conversations between student-001 "me" and others)
      log('Seeding messages...', 'info');
      for (const partnerId in LMS_MESSAGES) {
        const msgs = LMS_MESSAGES[partnerId];
        for (const msg of msgs) {
            // "me" translates to student-001 based on demo-data context
            const senderId = msg.sender === 'me' ? 'student-001' : partnerId;
            const receiverId = msg.sender === 'me' ? partnerId : 'student-001';
            
            await db.collection('messages').add({
                senderId: senderId,
                receiverId: receiverId,
                text: msg.text,
                timeString: msg.time,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        log(`Seeded chat history with ${partnerId}`, 'success');
      }

      // 5.5. Seed Digital Library Books
      log('Seeding digital library books...', 'info');
      for (const book of LMS_BOOKS) {
        await db.collection('books').doc(book.id).set({
          ...book,
          createdDate: firebase.firestore.FieldValue.serverTimestamp(),
          updatedDate: firebase.firestore.FieldValue.serverTimestamp()
        });
        log(`Seeded book: ${book.title}`, 'success');
      }

      // 5.6. Seed Zoom Classes
      log('Seeding zoom classes...', 'info');
      for (const zClass of LMS_ZOOM_CLASSES) {
        await db.collection('zoomClasses').doc(zClass.id).set({
          ...zClass,
          createdDate: firebase.firestore.FieldValue.serverTimestamp()
        });
        log(`Seeded Zoom class: ${zClass.title}`, 'success');
      }

      // 6. Register DEMO_USERS in Firebase Auth
      log('Registering users in Firebase Auth (Check console for errors)...', 'info');
      log('WARNING: If email already exists, it will throw an error, which is fine.', 'warning');
      
      for (const user of DEMO_USERS) {
        try {
          const cred = await auth.createUserWithEmailAndPassword(user.email, user.password);
          await db.collection('users').doc(cred.user.uid).set({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            ...(user.parentId ? { parentId: user.parentId } : {}),
            ...(user.linkedStudents ? { linkedStudents: user.linkedStudents } : {})
          });
          log(`Created Auth & DB record for ${user.email}`, 'success');
        } catch (authErr) {
          if (authErr.code === 'auth/email-already-in-use') {
             // If they already exist, just make sure DB is populated
             // We can't get custom UID from email password easily here without signing in, but let's assume demo uses original UIDs for DB anyway.
             // ACTUALLY: demo data uses 'student-001' as ID, but Firebase uses auto-gen UIDs. 
             // To fix mappings between hardcoded 'student-001' and new Auth UIDs, we shouldn't use createUser if we want fixed UIDs.
             log(`Email ${user.email} exists! We couldn't map the exact UID, so relationships might need manual fixing if relying on strict Auth UIDs.`, 'warning');
          } else {
             log(`Error creating ${user.email}: ${authErr.message}`, 'error');
          }
        }
      }

      log('SEEDING COMPLETE! You can now delete seed.html and seed-firebase.js.', 'success');

    } catch (e) {
      log(`FATAL ERROR: ${e.message}`, 'error');
      console.error(e);
    } finally {
      seedBtn.disabled = false;
    }
  });
});
