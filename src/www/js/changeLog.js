export const changeLog = `

🗓️ June 24, 2021
🔹 Reduced trilobite spawn density
⭐ Added 1 new land created by yours truly!
🔹 Moved monster toggle button
⭐ Added 9 new lands created by another person!

🗓️ June 21, 2021
🔹 Minimum view distance lowered, can now be set to be only the current land you are standing on
⭐ Added 1 new land created by yours truly!

🗓️ June 20, 2021
🐛 Fixed trilobites not wandering around out in the sea
🔹 Trilobites now wanders around instead of twitching on the spot
🚀 Added monster trilobites spawning around the world! Fight them back (PAGEDOWN) or they will bite you! Can be toggled off in the top toolbar 

🗓️ June 19, 2021
⭐ Added 1 new land created by yours truly!
⭐ Added 1 new land created by another person!
🔹 Can now sample land height (Y) for easier use of LAND_FIXED
🔹 Made LAND_EVEN with smooth brush much more effective
🔹 LAND_FIXED now supports smooth brush
🔹 Added a new LAND_FIXED to mouse actions, which sets the height within brush to the fixed number in the toolbar

🗓️ June 16, 2021
🔹 Props within brush now turn semi-transparent to easier see which ones will be affected
🐛 Fixed accidental removal of all editing, oops
🔹 Added speed and jump values to the quick summary section
🔹 Changed misc info to debug info section, now only shown when debug is active
🔹 Info box now displays the current land index the player is within (same index in filename when saving)

🗓️ June 14, 2021
🔹 Can now change view distance for taking those sweet screenshots! (Larger distance is very performance heavy) 
🔹 Added sound effect when trying to use DASH or SHIELD when they are not available 
🔹 Added sound effect when trying to use RECOVERY when it is empty 
🔹 Added a new item in shop for ease of travel 
🔹 Increased stat bar size and flipped order for better peripheral awareness 
🔹 Big performance boost for large brush sizes, especially with soft brush
⭐ Added 1 new land created by another person!

🗓️ June 13, 2021
⭐ Added 1 new land by yours truly! Try your skill at the Proving Grounds to the north!
🔹 Updated intro land with a LAVA encounter
🔹 Tweaked LAVA knockback to be more dangerous
🚀 Added land type LAVA that hurts player, changed INVISIBILITY to SHIELD and added a setback event when player toughness reaches zero! 
🔹 Added prototype INVISIBILITY ability (-) to try out the ABILITY points
🚀 Prototype RECOVERY points can now be used to refill other points with B / N / M, STAMINA no longer regenerates
🔹 Made the shop tab a bit more fancy and scalable
🔹 Flipped bottom UI order
🚀 Added a dash move (F) which is limited by regenerative STAMINA
🔹 Added sound effects for entering game and jumping
🔹 Created a shop tab
🔹 Changed inventory size
🔹 Added small inventory summary
🔹 Added some icons for mockup stat bars
🔹 Revised UI for the mockup stat bars

🗓️ June 12, 2021
⭐ Added 1 new land by yours truly!
🔹 Partially reworked UI (with some mockup elements)

🗓️ June 11, 2021
🔹 Created UI for editing player events
🔹 Created UI for editing props (interactions not yet available)

🗓️ June 1, 2021
🔹 50% done with adding player defined prop interactions
🔹 Rewrote all UI to use Preact framework to make life a bit easier

🗓️ May 30, 2021
⭐ Added 1 new land by yours truly!
🚀 Added functional items prototype to the inventory screen
🔹 Added browser tab icon
🔹 Added a bunch of color variations of prop PERSON
🔹 Increased view cone for reading props with text

🗓️ May 29, 2021
🔹 Made it easier to read prop texts and added visual feedback for which prop is in focus 
⭐ Added 1 new land created by another person!
⭐ Added 8 new lands created by another person!
🔹 Added some eyes to the prop PERSON
⭐ Sixth land created by another person added!  
🔹 Can now rotate props 45 degrees by holding SHIFT when rotating 
🐛 Fixed broken number hotkeys for mouse actions
🐛 Fixed bug where with movement slowed down at certain camera angles
🔹 Code cleanup, some bugs might pop up afterwards 

🗓️ May 28, 2021
🔹 Added prop STEPS and made an example of them in the intro land 
⭐ Fifth land created by another person added!  
⭐ Fourth land created by another person added! 

🗓️ May 27, 2021
🔹 Added prop HOUSE_WALL and HOUSE_ROOF 
🔹 Added some fresh crystals to intro land 
🐛 Fixed bug with brush did not render under water
🔹 Added prop CRYSTAL
🔹 Added prop FENCE and added it to the introduction land
🔹 Changed background color when transitioning into the game a bit more pleasing

🗓️ May 26, 2021
🔹 Created some internal shape helpers in order to create new props faster

🗓️ May 25, 2021
🔹 Added a new mouse action to even out lands
🐛 Fixed a bug crash when changing land/prop types with keyboard
🔹 Added some error handling so the game does not crash completely at any errors

🗓️ May 24, 2021
🚀 Added support for post-processing and made an edge silhouette effect with it

🗓️ May 23, 2021
🔹 Massive code cleanup, some bugs might pop up from this 
🐛 Fixed a bug where jumping/falling was affected by the slope below
🔹 Improved slope handling and added a debug mode 
🔹 Steep surfaces can no longer be climbed in gravity mode 
🔹 Change of plan, player avatar now looks in the direction it is moving 
🔹 Changed player avatar to something more fancy than a box and it now rotates with the camera 
🔹 Reworked movement and added a jump in gravity mode 

🗓️ May 22, 2021
🔹 Added a greeting message when you enter a land 
⭐ Third land created by another person added! 
🔹 Improved seam handling 
🔹 Performance improvements 

🗓️ May 21, 2021
🔹 Added a soft brush mode (default on) for those smooth rolling hills 
🔹 Changed player starting position to be more within the intro land 
⭐ Lands are now stitched for a more seamless experience 
🔹 Made the water a bit more fancy with some reflective sunlight 

🗓️ May 20, 2021
⭐ Second land created by another person added!

🗓️ May 19, 2021
🔹 Can now load saved land files 
🔹 Changed fly up/down controls as CTRL+W closes the browser tab 
⭐ First land created by another person added! 
🔹 Moved back starting position to better hint at unclaimed areas
🔹 Moved prop text to center of the screen when it shows
🔹 Tweaked rotation amount to ensure even degrees (90, 180, 270 are now possible)
🔹 Places some nice temple gates in the intro land
🔹 Added prop POLE_VERTICAL and POLE_HORIZONTAL

🗓️ May 18, 2021
🔹 Props can now be rotated

🗓️ May 17, 2021
🔹 Added prop PERSON and put it to good use in the introduction land!

🗓️ May 16, 2021
🔹 Added prop BUSH and reworked prop controls
🐛 Fixed a bug where props did not always render
🔹 Added a message if you try to claim a land owned by someone else
🔹 Added lighting to props
🔹 Fixed camera so it doesn't go haywire when looking completely up/down
🔹 Added land type STONE

🗓️ May 15, 2021
🔹 Improved welcome land and tweaked gravity mode
⭐ Added a welcome land
🔹 Can now toggle help text
🔹 Next up is data loading!
🔹 Mostly code cleanup and restructuring
🔹 Change log added to start screen
🔹 Added some fancy page loading and transitions for a more pleasing feeling
🚀 Prototype client is almost done, should give a feel of what is to come

`.trim();
