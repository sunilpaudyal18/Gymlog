# GYM — Exercise Library Architecture & Repository Documentation

## 1. Overview
The GYM (Kinetic Workout Companion) Exercise Library is a centralized, local-first, scalable repository providing canonical gym and strength-training movements across all major muscle groups and equipment categories.

---

## 2. Taxonomy & Muscle Group Coverage

The database spans all canonical muscle groups with secondary muscle classifications:

| Muscle Group | Primary Focus & Anatomical Regions | Legend Representation |
| :--- | :--- | :--- |
| **Chest** | Clavicular (Upper), Sternal (Mid/Lower), Pectoralis Major/Minor | Arnold Schwarzenegger |
| **Back** | Latissimus Dorsi, Trapezius, Rhomboids, Teres Major, Erector Spinae | Ronnie Coleman |
| **Legs** | Quadriceps, Hamstrings, Glutes, Calves, Adductors, Abductors, Tibialis | Tom Platz |
| **Shoulders** | Anterior Deltoid, Lateral Deltoid, Posterior Deltoid, Rotator Cuff | Franco Columbu |
| **Biceps** | Biceps Brachii (Long/Short Head), Brachialis, Brachioradialis | Larry Scott |
| **Triceps** | Long Head, Lateral Head, Medial Head | Dorian Yates |
| **Abs / Core** | Rectus Abdominis, Internal/External Obliques, Transverse Abdominis, Lower Back | Frank Zane |
| **Forearms** | Wrist Flexors, Wrist Extensors, Brachioradialis, Grip & Finger Strength | Lee Priest |

---

## 3. Equipment Categories

Exercises are classified across all established gym equipment types:
- **Barbell**
- **Dumbbells**
- **Cables**
- **Machine / Plate-Loaded**
- **Smith Machine**
- **Bodyweight / Calisthenics**
- **EZ Bar**
- **Kettlebell**
- **Resistance Band**
- **Landmine**
- **Trap Bar**
- **Specialty / Other**

---

## 4. Single Canonical Record & Cross-Muscle Discovery

Cross-muscle movements maintain **ONE canonical database entry** with primary and secondary muscle tagging rather than duplicate IDs:
- `Hammer Curl`: Primary: `biceps`, Secondary: `forearms` (appears when browsing both Biceps and Forearms).
- `Barbell Deadlift`: Primary: `back`, Secondary: `legs`, `glutes`, `forearms`.
- `Farmers Walk`: Primary: `forearms`, Secondary: `back`, `abs`, `legs`.
- `Dips`: Primary: `chest`, Secondary: `triceps`, `shoulders`.
- `Dumbbell Pullover`: Primary: `chest`, Secondary: `back`, `triceps`.

---

## 5. 7-Tier Ranked Search Engine

Search queries are evaluated using a deterministic scoring engine:
1. **Tier 1 (Score 100)**: Exact Exercise Name Match.
2. **Tier 2 (Score 90)**: Exercise Name Starts With Query.
3. **Tier 3 (Score 80)**: Exact Alias Match.
4. **Tier 4 (Score 70)**: Name Contains Query Substring.
5. **Tier 5 (Score 60)**: Alias Contains Query Substring.
6. **Tier 6 (Score 50)**: Searchable Term Match.
7. **Tier 7 (Score 30)**: Equipment or Primary/Secondary Muscle Match.
