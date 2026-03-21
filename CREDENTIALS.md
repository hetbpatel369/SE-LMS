# LMS Demo Credentials
> All passwords are `Demo@1234`. Visit `http://localhost:7890` to access the site.

## 👨‍🎓 Students

| Name | Email | Grade | Enrolled In | Parent |
|------|-------|-------|-------------|--------|
| Jordan Mitchell | `jordan.m@student.lms.edu` | 10 | Math 101, English Lit, CS Python, Physics | Robert Mitchell |
| Priya Sharma | `priya.s@student.lms.edu` | 11 | Math 101, Biology, History, Chemistry | Ananya Sharma |
| Ethan Kowalski | `ethan.k@student.lms.edu` | 10 | Math 101, Biology, CS Python, Physics | Robert Mitchell |
| Aisha Okonkwo | `aisha.o@student.lms.edu` | 12 | English Lit, CS Python, History, Chemistry | Emeka Okonkwo |
| Lucas Beaumont | `lucas.b@student.lms.edu` | 11 | Math 101, Biology, History, Chemistry, Visual Arts | Ananya Sharma |
| Sofia Reyes | `sofia.r@student.lms.edu` | 12 | English Lit, CS Python, Physics, History, Visual Arts | Emeka Okonkwo |

## 👨‍🏫 Professors

| Name | Email | Teaches |
|------|-------|---------|
| Dr. Alan Smith | `a.smith@lms.edu` | Mathematics 101, Physics – Mechanics & Waves |
| Ms. Sarah Johnson | `s.johnson@lms.edu` | English Literature 11, World History, Visual Arts |
| Dr. Rina Patel | `r.patel@lms.edu` | Biology – Cells & Genetics, Chemistry |
| Mr. James Chen | `j.chen@lms.edu` | Computer Science – Intro to Python |

## 👨‍👩‍👧 Parents

| Name | Email | Linked To |
|------|-------|-----------|
| Robert Mitchell | `r.mitchell@parent.lms.edu` | Jordan Mitchell, Ethan Kowalski |
| Ananya Sharma | `a.sharma@parent.lms.edu` | Priya Sharma, Lucas Beaumont |
| Emeka Okonkwo | `e.okonkwo@parent.lms.edu` | Aisha Okonkwo, Sofia Reyes |

## 🛡️ Admin

| Name | Email |
|------|-------|
| Dr. Margaret Osei | `admin@lms.edu` |

---

## 📚 Courses & Enrollment Map

| Course | Teacher | Students Enrolled |
|--------|---------|-------------------|
| Mathematics 101 | Dr. Alan Smith | Jordan, Priya, Ethan, Lucas |
| English Literature 11 | Ms. Sarah Johnson | Jordan, Aisha, Sofia |
| Biology – Cells & Genetics | Dr. Rina Patel | Priya, Ethan, Lucas |
| Computer Science – Intro to Python | Mr. James Chen | Jordan, Ethan, Aisha, Sofia |
| World History – Modern Era | Ms. Sarah Johnson | Priya, Aisha, Lucas, Sofia |
| Physics – Mechanics & Waves | Dr. Alan Smith | Jordan, Ethan, Sofia |
| Chemistry – Reactions & Stoichiometry | Dr. Rina Patel | Priya, Aisha, Lucas |
| Visual Arts & Design Thinking | Ms. Sarah Johnson | Aisha, Lucas, Sofia |

---

## 🔑 How Enrollments Work in Firebase

Each course document in Firestore has a `students` array containing the **real Firebase Auth UIDs** of enrolled students. The student dashboard queries:
```
courses.where('students', 'array-contains', currentUser.uid)
```

Events are filtered:
```
events.courseId must be in enrolledCourseIds[] for the event to appear
```
