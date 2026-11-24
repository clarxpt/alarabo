# Educational calculation model

The output is an illustrative exposure proxy in µSv, not a validated effective dose quantity.

D = R × t × (1 m / d)^2 × S × A × exp(-8x).

R is the illustrative reference rate at 1 m (µSv/min): orthopaedics 8, cardiology 15, vascular 12, URS 4, pain 3, central venous catheter 2. These are uncalibrated presets, not guideline dose rates or conversions from patient air kerma. t is minutes; d is distance in metres (minimum 0.5 m); x is apron lead equivalence in mm. S is a schematic side factor (1.5 tube, 0.6 detector, 1 lateral). A is a simplified angular factor using the existing Kuon-based endpoints, linear interpolation and multiplication of oblique and cranial/caudal factors. These assumptions are not validated across procedures. The side calculation follows the schematic rotation, not a physical 3D scatter map. The radial heat map is illustrative only.

The apron coefficient 8/mm is illustrative. Thyroid collars and lead glasses protect particular organs; no global numerical reduction is assigned. Display categories at 5 and 20 µSv are pedagogical, not safety limits.

The 20 mSv annual effective-dose limit is shown solely as a numerical educational reference, not an allowable exposure budget. Chest X-ray (20 µSv) and natural background (3 mSv/year illustrative scenario) are displayed independently as reference values, not calculated equivalents. Saved scenarios are not personal dose records; totals across different roles and models are not presented as a personal dose. The annual effective-dose limit is not used to calculate a percentage or a number of permitted procedures. Older records are marked separately; the saved-scenario sum excludes prior model versions.

## Validation needed
Trace each preset to measurements or published data with matching geometry, equipment, beam quality and dose quantity. Validate using appropriate dosimetry and medical physics expertise. Test sensitivity and uncertainty before making quantitative claims. Software unit tests verify arithmetic only, not physical validity.
