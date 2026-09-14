# Jane motion research

Read 14 September 2026. These sources inform motion principles, not copied art.

- [SLYNYRD: Pixelblog 50 — Human Walk Cycle](https://www.slynyrd.com/blog/2024/5/24/pixelblog-50-human-walk-cycle). Real-world reference, contact/down/passing/swing poses, opposing arm and leg motion, and a deliberate body-height rhythm inform the locomotion. Jane uses the project's established twelve poses and 80ms/50ms walk/run cadence, retaining the shared pixel world and fixed leg lengths. Her gait is an athletic character choice; body mechanics do not require an exaggerated gendered hip sway.
- [SLYNYRD: Pixelblog 60 — Side View Run ’N Gun](https://www.slynyrd.com/blog/2026/1/26/side-view-run-n-gun). Forward body inclination helps distinguish running, and different ascending and descending jump poses clarify motion. Jane's run and run-fire share lower-body and hair motion, as do jump and jump-fire.
- [SLYNYRD: Pixelblog 56 — Top Down Character Attack Animation](https://www.slynyrd.com/blog/2025/5/23/pixelblog-56-top-down-character-attack-animation). An attack separates preparation, a fast strike, follow-through, and recovery. Jane's punches and kicks have explicit timing per frame; each kick chambers, extends, retracts, and returns to stance. The far boot remains planted throughout. No limb is stretched to sell the hit.
- [Animation Mentor: Follow-through and Overlapping Action](https://www.animationmentor.com/blog/follow-through-and-overlapping-action-the-12-basic-principles-of-animation/). The primary body action drives attached material, whose movement drags and settles afterward. Jane's hair root follows the exact head displacement; four fixed-length links receive progressively delayed angular motion. During running the chain trails behind her with a wave, jumping changes its drag direction, and attack recovery continues after the strike.

## Pixel implementation

Big uses 23px thighs and 23px shins; mini uses separately authored 7px thighs and 7px shins. The two leg reach intervals constrain one shared pelvis without moving the planted targets. All joints snap to integer source pixels; subpixel bone rounding tolerance is tested.

The hair chain is authored independently at each size: big root (-7,-89) plus body displacement with link lengths 7/8/8/7px, mini root (-3,-29) plus displacement with 2/3/3/2px links. Roots and links never scale between sizes. Tail width tapers across five points. Rendering remains one source pixel per world unit.

`tests/jane-motion.cjs` checks all poses for connected fixed-length legs, floor clearance, stable planted kicks, smooth locomotion boundaries, fixed hair link lengths, backward run drag, changing relative tail shape, delayed kick recovery, and unchanged lower body/hair while firing.
