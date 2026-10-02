
// Section names
const SEC = ["News", "Campus", "Features", "Opinion", "Sports", "Arts"];

// Sample articles fallback if database/AJAX fails
const seed = [
    {
        id: "s1",
        title: "Student Council Approves New Library Hours for Exam Season",
        section: "News",
        author: "Maria Santos",
        date: "2026-09-22",
        tags: ["council", "library"],
        excerpt: "Beginning next month, the main library will stay open until midnight on weekdays.",
        body: [
            "The Student Council voted this week to extend library hours during the exam period, responding to a petition signed by more than 400 students.",
            "Council members said the change will run on a trial basis and be reviewed at the end of the term. Students can share feedback through the council's suggestion form."
        ]
    },
    {
        id: "s2",
        title: "Inside the Robotics Club's Race to Nationals",
        section: "Campus",
        author: "Jared Lim",
        date: "2026-09-20",
        tags: ["clubs", "robotics"],
        excerpt: "Late nights, spare parts and a stubborn robot arm: how a small team qualified.",
        body: [
            "In a cramped corner of the engineering building, twelve students have spent weeks rebuilding a robot that refused to grip.",
            "Their advisor says the real win is the teamwork. The team leaves for the national competition in November."
        ]
    }
];