/**
 * Practice Problems System
 * Interactive practice problems with step-by-step solutions
 */

class PracticeProblems {
    constructor() {
        this.problems = this.initializeProblems();
        this.userProgress = this.loadProgress();
    }

    loadProgress() {
        try {
            return JSON.parse(localStorage.getItem('physics-baseball-practice-progress') || '{}');
        } catch (e) {
            return {};
        }
    }

    saveProgress() {
        localStorage.setItem('physics-baseball-practice-progress', JSON.stringify(this.userProgress));
    }

    initializeProblems() {
        return {
            week1: {
                title: "Week 1: Physics of Motion - Practice Problems",
                problems: [
                    {
                        id: 1,
                        difficulty: "easy",
                        statement: "A baseball pitcher throws a fastball from the mound to home plate. The pitcher releases the ball at a height of 2.0 m and the ball reaches the catcher's mitt at a height of 1.5 m. The horizontal distance from the pitcher's mound to home plate is 18.4 m.",
                        given: [
                            "Initial height: h₀ = 2.0 m",
                            "Final height: h = 1.5 m", 
                            "Horizontal distance: d = 18.4 m",
                            "Acceleration due to gravity: g = 9.81 m/s²"
                        ],
                        find: "If the ball takes 0.4 seconds to reach home plate, calculate the initial horizontal velocity of the ball.",
                        solution: {
                            approach: "Since there is no acceleration in the horizontal direction, we can use the equation: d = v₀ₓ × t",
                            steps: [
                                {
                                    step: "Step 1: Identify the known values",
                                    content: "d = 18.4 m, t = 0.4 s"
                                },
                                {
                                    step: "Step 2: Apply the horizontal motion equation",
                                    content: "d = v₀ₓ × t"
                                },
                                {
                                    step: "Step 3: Solve for v₀ₓ",
                                    content: "v₀ₓ = d / t = 18.4 m / 0.4 s = 46 m/s"
                                }
                            ],
                            answer: "46 m/s",
                            explanation: "The horizontal velocity remains constant throughout the projectile motion, so the initial horizontal velocity is 46 m/s."
                        }
                    },
                    {
                        id: 2,
                        difficulty: "medium",
                        statement: "A baseball is thrown horizontally from a height of 1.8 m with an initial speed of 25 m/s. Calculate how far the ball travels horizontally before hitting the ground.",
                        given: [
                            "Initial height: h₀ = 1.8 m",
                            "Initial horizontal velocity: v₀ₓ = 25 m/s",
                            "Initial vertical velocity: v₀ᵧ = 0 m/s (thrown horizontally)",
                            "Acceleration due to gravity: g = 9.81 m/s²"
                        ],
                        find: "Horizontal distance traveled before hitting the ground.",
                        solution: {
                            approach: "First find the time of flight using vertical motion, then calculate horizontal distance.",
                            steps: [
                                {
                                    step: "Step 1: Find time of flight using vertical motion",
                                    content: "y = h₀ + v₀ᵧt - ½gt²\n0 = 1.8 + 0×t - ½(9.81)t²\n0 = 1.8 - 4.905t²\nt² = 1.8/4.905 = 0.367\nt = √0.367 = 0.606 s"
                                },
                                {
                                    step: "Step 2: Calculate horizontal distance",
                                    content: "x = v₀ₓ × t = 25 × 0.606 = 15.15 m"
                                }
                            ],
                            answer: "15.2 m",
                            explanation: "The ball travels horizontally for 15.2 meters before hitting the ground. The horizontal and vertical motions are independent."
                        }
                    },
                    {
                        id: 3,
                        difficulty: "hard",
                        statement: "A baseball player hits a ball with an initial velocity of 40 m/s at an angle of 35° above the horizontal from a height of 1.0 m above the ground. A 3.0 m high fence is located 90 m away from the batter.",
                        given: [
                            "Initial speed: v₀ = 40 m/s",
                            "Launch angle: θ = 35°",
                            "Initial height: h₀ = 1.0 m",
                            "Fence height: 3.0 m",
                            "Fence distance: 90 m",
                            "g = 9.81 m/s²"
                        ],
                        find: "Will the ball clear the fence? If so, by how much? If not, by how much does it miss?",
                        solution: {
                            approach: "Find the height of the ball when it reaches the fence location (x = 90 m).",
                            steps: [
                                {
                                    step: "Step 1: Calculate velocity components",
                                    content: "v₀ₓ = v₀ cos(35°) = 40 × 0.819 = 32.8 m/s\nv₀ᵧ = v₀ sin(35°) = 40 × 0.574 = 23.0 m/s"
                                },
                                {
                                    step: "Step 2: Find time to reach fence",
                                    content: "x = v₀ₓ × t\n90 = 32.8 × t\nt = 90/32.8 = 2.74 s"
                                },
                                {
                                    step: "Step 3: Calculate height at fence location",
                                    content: "y = h₀ + v₀ᵧt - ½gt²\ny = 1.0 + 23.0(2.74) - ½(9.81)(2.74)²\ny = 1.0 + 63.02 - 36.88 = 27.14 m"
                                },
                                {
                                    step: "Step 4: Compare with fence height",
                                    content: "Ball height at fence: 27.14 m\nFence height: 3.0 m\nClearance: 27.14 - 3.0 = 24.14 m"
                                }
                            ],
                            answer: "Yes, the ball clears the fence by 24.1 m",
                            explanation: "The ball easily clears the 3.0 m fence, reaching a height of 27.1 m at the fence location. This is a home run!"
                        }
                    }
                ]
            },
            week2: {
                title: "Week 2: Projectile Motion - Practice Problems",
                problems: [
                    {
                        id: 1,
                        difficulty: "easy",
                        statement: "A baseball is dropped from rest at a height of 10 m. Calculate the time it takes to hit the ground and its final velocity just before impact.",
                        given: [
                            "Initial height: h₀ = 10 m",
                            "Initial velocity: v₀ = 0 m/s (dropped from rest)",
                            "Acceleration due to gravity: g = 9.81 m/s²"
                        ],
                        find: "Time of fall and final velocity",
                        solution: {
                            approach: "Use kinematic equations for constant acceleration.",
                            steps: [
                                {
                                    step: "Step 1: Find time using position equation",
                                    content: "y = y₀ + v₀t + ½at²\n0 = 10 + 0×t + ½(-9.81)t²\n0 = 10 - 4.905t²\nt² = 10/4.905 = 2.04\nt = √2.04 = 1.43 s"
                                },
                                {
                                    step: "Step 2: Find final velocity",
                                    content: "v = v₀ + at = 0 + (-9.81)(1.43) = -14.0 m/s\n|v| = 14.0 m/s downward"
                                }
                            ],
                            answer: "Time: 1.43 s, Final velocity: 14.0 m/s downward",
                            explanation: "The negative sign indicates downward direction. The ball falls for 1.43 seconds and hits the ground at 14.0 m/s."
                        }
                    },
                    {
                        id: 2,
                        difficulty: "medium",
                        statement: "A pitcher throws a curveball with an initial velocity of 28 m/s at an angle of 5° below the horizontal from a height of 2.1 m. The ball crosses home plate 18.4 m away.",
                        given: [
                            "Initial speed: v₀ = 28 m/s",
                            "Launch angle: θ = -5° (below horizontal)",
                            "Initial height: h₀ = 2.1 m",
                            "Horizontal distance: x = 18.4 m",
                            "g = 9.81 m/s²"
                        ],
                        find: "The height of the ball when it crosses home plate",
                        solution: {
                            approach: "Use projectile motion equations to find the height at x = 18.4 m.",
                            steps: [
                                {
                                    step: "Step 1: Calculate velocity components",
                                    content: "v₀ₓ = v₀ cos(-5°) = 28 × 0.996 = 27.9 m/s\nv₀ᵧ = v₀ sin(-5°) = 28 × (-0.087) = -2.44 m/s"
                                },
                                {
                                    step: "Step 2: Find time to reach home plate",
                                    content: "x = v₀ₓ × t\n18.4 = 27.9 × t\nt = 18.4/27.9 = 0.659 s"
                                },
                                {
                                    step: "Step 3: Calculate height at home plate",
                                    content: "y = h₀ + v₀ᵧt - ½gt²\ny = 2.1 + (-2.44)(0.659) - ½(9.81)(0.659)²\ny = 2.1 - 1.61 - 2.13 = -1.64 m"
                                }
                            ],
                            answer: "The ball would be 1.64 m below ground level",
                            explanation: "This indicates the ball hits the ground before reaching home plate. The calculation shows the theoretical position if the ground weren't there."
                        }
                    }
                ]
            },
            week3: {
                title: "Week 3: Forces and Newton's Laws - Practice Problems", 
                problems: [
                    {
                        id: 1,
                        difficulty: "easy",
                        statement: "A 0.145 kg baseball experiences air resistance of 0.8 N while falling. Calculate the net force acting on the ball and its acceleration.",
                        given: [
                            "Mass of baseball: m = 0.145 kg",
                            "Air resistance force: F_air = 0.8 N (upward)",
                            "Gravitational acceleration: g = 9.81 m/s²"
                        ],
                        find: "Net force and acceleration of the baseball",
                        solution: {
                            approach: "Apply Newton's Second Law: ΣF = ma",
                            steps: [
                                {
                                    step: "Step 1: Calculate gravitational force",
                                    content: "F_gravity = mg = 0.145 kg × 9.81 m/s² = 1.42 N (downward)"
                                },
                                {
                                    step: "Step 2: Find net force",
                                    content: "F_net = F_gravity - F_air = 1.42 N - 0.8 N = 0.62 N (downward)"
                                },
                                {
                                    step: "Step 3: Calculate acceleration",
                                    content: "a = F_net / m = 0.62 N / 0.145 kg = 4.28 m/s² (downward)"
                                }
                            ],
                            answer: "Net force: 0.62 N downward, Acceleration: 4.28 m/s² downward",
                            explanation: "Air resistance reduces the net downward force, resulting in an acceleration less than g."
                        }
                    }
                ]
            },
            week4: {
                title: "Week 4: Momentum and Impulse - Practice Problems",
                problems: [
                    {
                        id: 1,
                        difficulty: "easy",
                        statement: "A baseball bat hits a 0.145 kg baseball. Before the collision, the ball is moving toward the bat at 35 m/s. After the collision, it moves away from the bat at 42 m/s. Calculate the change in momentum of the baseball.",
                        given: [
                            "Mass of baseball: m = 0.145 kg",
                            "Initial velocity: v₁ = -35 m/s (toward bat)",
                            "Final velocity: v₂ = +42 m/s (away from bat)"
                        ],
                        find: "Change in momentum of the baseball",
                        solution: {
                            approach: "Use the definition of momentum change: Δp = m(v₂ - v₁)",
                            steps: [
                                {
                                    step: "Step 1: Calculate initial momentum",
                                    content: "p₁ = mv₁ = 0.145 kg × (-35 m/s) = -5.075 kg⋅m/s"
                                },
                                {
                                    step: "Step 2: Calculate final momentum", 
                                    content: "p₂ = mv₂ = 0.145 kg × (+42 m/s) = +6.09 kg⋅m/s"
                                },
                                {
                                    step: "Step 3: Find change in momentum",
                                    content: "Δp = p₂ - p₁ = 6.09 - (-5.075) = 11.165 kg⋅m/s"
                                }
                            ],
                            answer: "11.17 kg⋅m/s",
                            explanation: "The change in momentum is positive, indicating the ball gained momentum in the positive direction (away from the bat)."
                        }
                    },
                    {
                        id: 2,
                        difficulty: "medium",
                        statement: "A pitcher's hand applies a force to a baseball for 0.15 seconds during the pitching motion. The ball's velocity changes from 0 to 38 m/s. If the ball has a mass of 0.145 kg, calculate the average force applied.",
                        given: [
                            "Mass of baseball: m = 0.145 kg",
                            "Initial velocity: v₁ = 0 m/s",
                            "Final velocity: v₂ = 38 m/s",
                            "Time interval: Δt = 0.15 s"
                        ],
                        find: "Average force applied by the pitcher's hand",
                        solution: {
                            approach: "Use the impulse-momentum theorem: FΔt = Δp = mΔv",
                            steps: [
                                {
                                    step: "Step 1: Calculate change in velocity",
                                    content: "Δv = v₂ - v₁ = 38 - 0 = 38 m/s"
                                },
                                {
                                    step: "Step 2: Apply impulse-momentum theorem",
                                    content: "FΔt = mΔv\nF × 0.15 s = 0.145 kg × 38 m/s\nF × 0.15 = 5.51"
                                },
                                {
                                    step: "Step 3: Solve for force",
                                    content: "F = 5.51 / 0.15 = 36.7 N"
                                }
                            ],
                            answer: "36.7 N",
                            explanation: "This is the average force during the pitching motion. The actual force varies throughout the motion, being much higher at the moment of release."
                        }
                    }
                ]
            },
            week5: {
                title: "Week 5: Work and Energy in Baseball Pitching - Practice Problems",
                problems: [
                    {
                        id: 1,
                        difficulty: "easy",
                        statement: "A baseball is thrown horizontally from a height of 2.0 m with initial speed of 25 m/s. Calculate the ball's kinetic energy when it hits the ground.",
                        given: [
                            "Mass of baseball: m = 0.145 kg",
                            "Initial height: h = 2.0 m", 
                            "Initial horizontal velocity: v₀ = 25 m/s",
                            "g = 9.81 m/s²"
                        ],
                        find: "Kinetic energy when ball hits the ground",
                        solution: {
                            approach: "Use conservation of energy: Initial KE + Initial PE = Final KE",
                            steps: [
                                {
                                    step: "Step 1: Calculate initial kinetic energy",
                                    content: "KE₀ = ½mv₀² = ½ × 0.145 × (25)² = ½ × 0.145 × 625 = 45.3 J"
                                },
                                {
                                    step: "Step 2: Calculate initial potential energy",
                                    content: "PE₀ = mgh = 0.145 × 9.81 × 2.0 = 2.85 J"
                                },
                                {
                                    step: "Step 3: Apply conservation of energy",
                                    content: "KE_final = KE₀ + PE₀ = 45.3 + 2.85 = 48.15 J"
                                }
                            ],
                            answer: "48.2 J",
                            explanation: "The kinetic energy increases because gravitational potential energy is converted to kinetic energy as the ball falls."
                        }
                    }
                ]
            },
            week6: {
                title: "Week 6: Circular Motion and Angular Velocity - Practice Problems",
                problems: [
                    {
                        id: 1,
                        difficulty: "medium",
                        statement: "A baseball pitcher's arm rotates through an angle of 180° (π radians) in 0.12 seconds during the delivery. Calculate the average angular velocity of the arm.",
                        given: [
                            "Angular displacement: θ = π radians (180°)",
                            "Time interval: t = 0.12 s"
                        ],
                        find: "Average angular velocity of the pitcher's arm",
                        solution: {
                            approach: "Use the definition of angular velocity: ω = θ/t",
                            steps: [
                                {
                                    step: "Step 1: Apply angular velocity formula",
                                    content: "ω = θ/t = π rad / 0.12 s = π/0.12 rad/s"
                                },
                                {
                                    step: "Step 2: Calculate numerical value",
                                    content: "ω = 3.14159/0.12 = 26.18 rad/s"
                                }
                            ],
                            answer: "26.2 rad/s",
                            explanation: "This high angular velocity demonstrates why pitchers can generate such high ball speeds through rotational motion."
                        }
                    }
                ]
            },
            week7: {
                title: "Week 7: Torque and Angular Momentum - Practice Problems",
                problems: [
                    {
                        id: 1,
                        difficulty: "medium",
                        statement: "A pitcher applies a force of 400 N perpendicular to their forearm at a distance of 0.35 m from the elbow joint. Calculate the torque about the elbow.",
                        given: [
                            "Applied force: F = 400 N",
                            "Distance from axis: r = 0.35 m",
                            "Angle between F and r: θ = 90° (perpendicular)"
                        ],
                        find: "Torque about the elbow joint",
                        solution: {
                            approach: "Use the torque equation: τ = rF sin(θ)",
                            steps: [
                                {
                                    step: "Step 1: Apply torque formula",
                                    content: "τ = rF sin(θ) = 0.35 m × 400 N × sin(90°)"
                                },
                                {
                                    step: "Step 2: Calculate (sin 90° = 1)",
                                    content: "τ = 0.35 × 400 × 1 = 140 N⋅m"
                                }
                            ],
                            answer: "140 N⋅m",
                            explanation: "This torque causes angular acceleration of the forearm, contributing to ball velocity generation."
                        }
                    }
                ]
            },
            week8: {
                title: "Week 8: The Physics of Spin - Practice Problems",
                problems: [
                    {
                        id: 1,
                        difficulty: "easy",
                        statement: "A curveball spins at 1800 rpm with backspin. If the ball has a radius of 3.7 cm, calculate the surface speed of the ball due to spin.",
                        given: [
                            "Spin rate: ω = 1800 rpm",
                            "Ball radius: r = 3.7 cm = 0.037 m"
                        ],
                        find: "Surface speed due to spin",
                        solution: {
                            approach: "Convert rpm to rad/s, then use v = ωr",
                            steps: [
                                {
                                    step: "Step 1: Convert rpm to rad/s",
                                    content: "ω = 1800 rpm × (2π rad/rev) × (1 min/60 s) = 1800 × 2π/60 = 188.5 rad/s"
                                },
                                {
                                    step: "Step 2: Calculate surface speed",
                                    content: "v = ωr = 188.5 rad/s × 0.037 m = 6.97 m/s"
                                }
                            ],
                            answer: "6.97 m/s",
                            explanation: "This surface speed creates the air pressure differences that cause the Magnus effect and ball movement."
                        }
                    }
                ]
            },
            week9: {
                title: "Week 9: Aerodynamics and Air Resistance - Practice Problems",
                problems: [
                    {
                        id: 1,
                        difficulty: "hard",
                        statement: "A baseball traveling at 40 m/s experiences air resistance. The drag coefficient is 0.3, the ball's cross-sectional area is 0.0042 m², and air density is 1.225 kg/m³. Compare the drag force to the gravitational force on the 0.145 kg ball.",
                        given: [
                            "Velocity: v = 40 m/s",
                            "Drag coefficient: Cd = 0.3",
                            "Cross-sectional area: A = 0.0042 m²",
                            "Air density: ρ = 1.225 kg/m³",
                            "Ball mass: m = 0.145 kg",
                            "g = 9.81 m/s²"
                        ],
                        find: "Comparison of drag force to gravitational force",
                        solution: {
                            approach: "Calculate both forces and compare their magnitudes",
                            steps: [
                                {
                                    step: "Step 1: Calculate drag force",
                                    content: "F_drag = ½ρCdAv² = ½ × 1.225 × 0.3 × 0.0042 × (40)²\nF_drag = 0.5 × 1.225 × 0.3 × 0.0042 × 1600 = 1.23 N"
                                },
                                {
                                    step: "Step 2: Calculate gravitational force",
                                    content: "F_gravity = mg = 0.145 kg × 9.81 m/s² = 1.42 N"
                                },
                                {
                                    step: "Step 3: Compare the forces",
                                    content: "Ratio = F_drag / F_gravity = 1.23 / 1.42 = 0.87\nDrag force is 87% of gravitational force"
                                }
                            ],
                            answer: "Drag force (1.23 N) is 87% of gravitational force (1.42 N)",
                            explanation: "At high speeds, air resistance becomes very significant, nearly equal to the weight of the ball. This shows why air resistance cannot be ignored in real baseball trajectories."
                        }
                    }
                ]
            },
            week10: {
                title: "Week 10: Optimizing Pitching Mechanics - Practice Problems",
                problems: [
                    {
                        id: 1,
                        difficulty: "medium",
                        statement: "A pitcher's kinetic chain transfers energy from legs to ball. If 70% of the leg energy (300 J) transfers to the core, 80% of core energy transfers to the arm, and 85% of arm energy transfers to the ball, how much energy reaches the ball?",
                        given: [
                            "Initial leg energy: E_legs = 300 J",
                            "Leg-to-core efficiency: 70%",
                            "Core-to-arm efficiency: 80%",
                            "Arm-to-ball efficiency: 85%"
                        ],
                        find: "Energy that reaches the ball",
                        solution: {
                            approach: "Calculate energy transfer through each stage of the kinetic chain",
                            steps: [
                                {
                                    step: "Step 1: Energy transferred to core",
                                    content: "E_core = 0.70 × 300 J = 210 J"
                                },
                                {
                                    step: "Step 2: Energy transferred to arm",
                                    content: "E_arm = 0.80 × 210 J = 168 J"
                                },
                                {
                                    step: "Step 3: Energy transferred to ball",
                                    content: "E_ball = 0.85 × 168 J = 142.8 J"
                                }
                            ],
                            answer: "142.8 J",
                            explanation: "Only 47.6% of the original leg energy reaches the ball, highlighting the importance of efficient mechanics in the kinetic chain."
                        }
                    }
                ]
            },
            week11: {
                title: "Week 11: Measurement and Data Analysis - Practice Problems",
                problems: [
                    {
                        id: 1,
                        difficulty: "medium",
                        statement: "A coach measures pitch velocities (in m/s): 38, 40, 39, 41, 37, 42, 38, 40, 39, 41. Calculate the mean, median, and standard deviation.",
                        given: [
                            "Velocity measurements: 38, 40, 39, 41, 37, 42, 38, 40, 39, 41 m/s",
                            "Number of measurements: n = 10"
                        ],
                        find: "Mean, median, and standard deviation of the data",
                        solution: {
                            approach: "Use statistical formulas for central tendency and spread",
                            steps: [
                                {
                                    step: "Step 1: Calculate mean",
                                    content: "Mean = (38+40+39+41+37+42+38+40+39+41)/10 = 395/10 = 39.5 m/s"
                                },
                                {
                                    step: "Step 2: Find median (ordered: 37,38,38,39,39,40,40,41,41,42)",
                                    content: "Median = (39+40)/2 = 39.5 m/s (average of 5th and 6th values)"
                                },
                                {
                                    step: "Step 3: Calculate standard deviation",
                                    content: "Variance = Σ(x-μ)²/n = [(38-39.5)² + (40-39.5)² + ... + (41-39.5)²]/10\nVariance = [2.25+0.25+0.25+2.25+6.25+6.25+2.25+0.25+0.25+2.25]/10 = 2.25\nStandard deviation = √2.25 = 1.5 m/s"
                                }
                            ],
                            answer: "Mean: 39.5 m/s, Median: 39.5 m/s, Std Dev: 1.5 m/s",
                            explanation: "The mean and median are equal, suggesting a symmetric distribution. The standard deviation of 1.5 m/s indicates the typical variation in pitch speeds."
                        }
                    }
                ]
            },
            week12: {
                title: "Week 12: The Physics of Pitching Equipment - Practice Problems",
                problems: [
                    {
                        id: 1,
                        difficulty: "easy",
                        statement: "A pitcher throws from a mound that is 10 inches (0.254 m) high. The horizontal distance to home plate is 18.4 m. Calculate the angle of descent for a ball thrown horizontally from this height.",
                        given: [
                            "Mound height: h = 0.254 m",
                            "Horizontal distance: d = 18.4 m",
                            "Ball thrown horizontally (initial vertical velocity = 0)"
                        ],
                        find: "Angle of descent when the ball reaches home plate",
                        solution: {
                            approach: "Use geometry and projectile motion principles",
                            steps: [
                                {
                                    step: "Step 1: The angle of descent",
                                    content: "tan(θ) = opposite/adjacent = height/horizontal distance"
                                },
                                {
                                    step: "Step 2: Calculate angle",
                                    content: "tan(θ) = 0.254 m / 18.4 m = 0.0138\nθ = arctan(0.0138) = 0.79°"
                                }
                            ],
                            answer: "0.79° below horizontal",
                            explanation: "The elevated mound creates a slight downward angle, making it more difficult for batters to make solid contact with the ball."
                        }
                    }
                ]
            },
            week13: {
                title: "Week 13: Review and Application - Practice Problems",
                problems: [
                    {
                        id: 1,
                        difficulty: "hard",
                        statement: "Comprehensive Problem: A pitcher throws a baseball (m = 0.145 kg) at 35 m/s at 15° above horizontal from a height of 2.1 m. The ball spins at 2000 rpm causing a Magnus force of 0.8 N perpendicular to its velocity. Analyze the complete motion including spin effects.",
                        given: [
                            "Mass: m = 0.145 kg",
                            "Initial velocity: v₀ = 35 m/s at 15°",
                            "Initial height: h₀ = 2.1 m",
                            "Spin rate: 2000 rpm",
                            "Magnus force: F_Magnus = 0.8 N perpendicular to velocity"
                        ],
                        find: "Time of flight, horizontal distance, and effect of Magnus force",
                        solution: {
                            approach: "Combine projectile motion with Magnus effect analysis",
                            steps: [
                                {
                                    step: "Step 1: Velocity components",
                                    content: "v₀ₓ = 35 cos(15°) = 33.8 m/s\nv₀ᵧ = 35 sin(15°) = 9.06 m/s"
                                },
                                {
                                    step: "Step 2: Time of flight (ignoring Magnus initially)",
                                    content: "Using y = h₀ + v₀ᵧt - ½gt²\n0 = 2.1 + 9.06t - 4.905t²\nSolving: t = 2.05 s"
                                },
                                {
                                    step: "Step 3: Horizontal distance without Magnus",
                                    content: "x = v₀ₓ × t = 33.8 × 2.05 = 69.3 m"
                                },
                                {
                                    step: "Step 4: Magnus effect acceleration",
                                    content: "a_Magnus = F_Magnus/m = 0.8/0.145 = 5.5 m/s²\nThis creates additional displacement perpendicular to velocity"
                                },
                                {
                                    step: "Step 5: Estimate Magnus displacement",
                                    content: "Additional lateral displacement ≈ ½ × 5.5 × (2.05)² ≈ 12.3 m"
                                }
                            ],
                            answer: "Flight time: 2.05 s, Range: ~69 m, Magnus effect: ~12 m lateral displacement",
                            explanation: "This comprehensive problem shows how multiple physics principles work together: projectile motion provides the basic trajectory, while the Magnus effect from spin significantly alters the ball's path, creating the movement that makes pitches effective."
                        }
                    }
                ]
            }
        };
    }

    createPracticeSet(weekId, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !this.problems[weekId]) return;

        const practiceSet = this.problems[weekId];
        
        container.innerHTML = `
            <div class="practice-container">
                <div class="practice-header">
                    <h3>🎯 ${practiceSet.title}</h3>
                    <div class="problem-count">${practiceSet.problems.length} Problems</div>
                </div>
                <div class="practice-intro">
                    <p>Work through these practice problems to reinforce your understanding of the physics concepts. Each problem includes step-by-step solutions.</p>
                    <div class="difficulty-legend">
                        <span class="difficulty-badge easy">Easy</span>
                        <span class="difficulty-badge medium">Medium</span>
                        <span class="difficulty-badge hard">Hard</span>
                    </div>
                </div>
                <div class="problems-container">
                    ${this.renderProblems(practiceSet.problems, weekId)}
                </div>
            </div>
        `;
    }

    renderProblems(problems, weekId) {
        return problems.map((problem, index) => {
            const solutionId = `solution-${weekId}-${problem.id}`;
            return `
                <div class="problem-container" data-problem-id="${problem.id}">
                    <div class="problem-header">
                        <span class="problem-number">Problem ${problem.id}</span>
                        <span class="difficulty-badge ${problem.difficulty}">${problem.difficulty}</span>
                    </div>
                    
                    <div class="problem-statement">${problem.statement}</div>
                    
                    <div class="problem-given">
                        <h5>📋 Given:</h5>
                        <ul>
                            ${problem.given.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="problem-find">
                        <h5>🎯 Find:</h5>
                        <p>${problem.find}</p>
                    </div>
                    
                    <div class="solution-toggle">
                        <button class="btn btn-secondary" onclick="practiceProblems.toggleSolution('${solutionId}')">
                            Show Solution 👁️
                        </button>
                    </div>
                    
                    <div id="${solutionId}" class="solution-content">
                        ${this.renderSolution(problem.solution)}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderSolution(solution) {
        return `
            <div class="solution-header">
                <h5>💡 Solution Approach</h5>
                <p>${solution.approach}</p>
            </div>
            
            <div class="solution-steps">
                <h5>📝 Step-by-Step Solution</h5>
                ${solution.steps.map(step => `
                    <div class="solution-step">
                        <div class="step-title">${step.step}</div>
                        <div class="step-content">${step.content.replace(/\n/g, '<br>')}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="solution-answer">
                <h5>✅ Final Answer</h5>
                <div class="final-answer">${solution.answer}</div>
            </div>
            
            <div class="solution-explanation">
                <h5>🔍 Explanation</h5>
                <p>${solution.explanation}</p>
            </div>
        `;
    }

    toggleSolution(solutionId) {
        const solutionElement = document.getElementById(solutionId);
        const button = document.querySelector(`button[onclick*="${solutionId}"]`);
        
        if (solutionElement.classList.contains('show')) {
            solutionElement.classList.remove('show');
            button.textContent = 'Show Solution 👁️';
        } else {
            solutionElement.classList.add('show');
            button.textContent = 'Hide Solution 🙈';
            this.trackSolutionViewed(solutionId);
        }
    }

    trackSolutionViewed(solutionId) {
        const [, weekId, problemId] = solutionId.split('-');
        const key = `${weekId}-${problemId}`;
        
        if (!this.userProgress.solutionsViewed) {
            this.userProgress.solutionsViewed = [];
        }
        
        if (!this.userProgress.solutionsViewed.includes(key)) {
            this.userProgress.solutionsViewed.push(key);
            this.saveProgress();
        }
    }

    // Additional utility methods
    getProblemsByDifficulty(weekId, difficulty) {
        if (!this.problems[weekId]) return [];
        return this.problems[weekId].problems.filter(p => p.difficulty === difficulty);
    }

    getRandomProblem(weekId) {
        if (!this.problems[weekId]) return null;
        const problems = this.problems[weekId].problems;
        return problems[Math.floor(Math.random() * problems.length)];
    }

    getUserProgress(weekId) {
        return this.userProgress[weekId] || {
            solutionsViewed: [],
            problemsCompleted: []
        };
    }

    // Create a quick practice mode
    createQuickPractice(containerId, weekIds = ['week1', 'week2', 'week3']) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const allProblems = [];
        weekIds.forEach(weekId => {
            if (this.problems[weekId]) {
                allProblems.push(...this.problems[weekId].problems.map(p => ({
                    ...p,
                    week: weekId
                })));
            }
        });

        // Shuffle problems
        const shuffledProblems = allProblems.sort(() => Math.random() - 0.5);
        const selectedProblems = shuffledProblems.slice(0, 5); // Take 5 random problems

        container.innerHTML = `
            <div class="practice-container">
                <div class="practice-header">
                    <h3>⚡ Quick Practice</h3>
                    <div class="problem-count">${selectedProblems.length} Random Problems</div>
                </div>
                <div class="practice-intro">
                    <p>Random selection of problems from multiple weeks. Perfect for review!</p>
                </div>
                <div class="problems-container">
                    ${selectedProblems.map((problem, index) => {
                        const solutionId = `quick-solution-${index}`;
                        return `
                            <div class="problem-container" data-problem-id="${problem.id}">
                                <div class="problem-header">
                                    <span class="problem-number">Problem ${index + 1} (Week ${problem.week.replace('week', '')})</span>
                                    <span class="difficulty-badge ${problem.difficulty}">${problem.difficulty}</span>
                                </div>
                                
                                <div class="problem-statement">${problem.statement}</div>
                                
                                <div class="problem-given">
                                    <h5>📋 Given:</h5>
                                    <ul>
                                        ${problem.given.map(item => `<li>${item}</li>`).join('')}
                                    </ul>
                                </div>
                                
                                <div class="problem-find">
                                    <h5>🎯 Find:</h5>
                                    <p>${problem.find}</p>
                                </div>
                                
                                <div class="solution-toggle">
                                    <button class="btn btn-secondary" onclick="practiceProblems.toggleSolution('${solutionId}')">
                                        Show Solution 👁️
                                    </button>
                                </div>
                                
                                <div id="${solutionId}" class="solution-content">
                                    ${this.renderSolution(problem.solution)}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="practice-actions">
                    <button class="btn btn-primary" onclick="practiceProblems.createQuickPractice('${containerId}')">
                        🎲 New Random Set
                    </button>
                </div>
            </div>
        `;
    }
}

// Initialize the practice problems system
const practiceProblems = new PracticeProblems();

// Export for use in HTML pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PracticeProblems;
}