;; GameBoy code to display a single image.
;; The image should use exactly 360 tiles and the tile map and tiles should be
;; organized so that a tile addressing mode switch at LY == 90 will render the
;; image correctly.
;;
;; The tile map and tile data are left blank. The intention is to fill them in
;; after the ROM is already built by modifying the ROM file directly to plug in
;; the desired data. To know where to plug in the data you can use the .sym
;; file. To get the .sym file use the -n sym_file flag when running rgblink.
;; The line with TileMap.start gives the location of where to put the tile map.
;; The line with TileData.start gives the location for the tile data. The
;; locations are given as bank_number:offset. The bank_number is 00 for this
;; ROM since it doesn't use an MBC. The offset is in hexadecimal and tells you
;; the byte index of where to start the data.SECTION "Header", ROM0[$100]
SECTION "Header", ROM0[$100]

EntryPoint:
        di ; Disable interrupts.
        jp Start

REPT $150 - $104
    db 0
ENDR

SECTION "Game code", ROM0

Start:
.waitVBlank
  ld a, [$FF44]
  cp 144 ; Check if the LCD is past VBlank
  jr c, .waitVBlank
  ;; turn off screen by setting rLCDC to 0
  xor a ; equivalent to ld a, 0
  ld [$FF40], a

  ;; copy tile map
  ld hl, $9800 ; tile map 0
  ld bc, TileMap.start
  ;; column counter
  ld d, 20
  ;; row counter
  ld e, 18

.tilemapcopyloop
  ld a, [bc]
  ld [hli], a
  inc bc
  dec d
  jr nz, .tilemapcopyloop
  ;; d is 0 so we're done copying a row

  ;; reset the column counter
  ld d, 20

  ;; move hl to the first column of the next row
  ld a, 12
  add l
  ld l, a
  ld a, 0 ; use ld to preserve the carry flag
  adc a, h
  ld h, a

  ;; decrease the row counter
  dec e
  jr nz, .tilemapcopyloop
  ;; row conter is 0 so we're done copying the tile map

  ;; copy the tile data

  ;; setup tile count registers
  ld a, [TileByteCount]
  ld e, a
  ld a, [TileByteCount + 1]
  ld d, a

  ld hl, $8000
  ld bc, TileData.start

.tiledatacopyloop
  ld a, [bc]
  ld [hli], a
  inc bc

  dec de
  xor a
  cp a, e
  jr nz, .tiledatacopyloop
  cp a, d
  jr nz, .tiledatacopyloop

  ;; set bg palette
  ld a, %11100100
  ld [$FF47], a
  ;; turn screen back on
  ld a, %10010001
  ld [$FF40], a

  ;; setup LYC to know when to switch addressing mode
  ;; Using line 90 because it's after the first 128 tiles are rendered and
  ;; before the the last 128 tiles. Any line that fits that criteria works.
  ld a, 90
  ld [$FF45], a

  ;; setup interupts
  ld a, %01000000
  ld [$FF41], a ; turn on LY=LYC for LCD interupts

  ld a, %00000010
  ld [$FFFF], a

.displayloop
  ;; halt to wait for LYC interupt rather than use interupt handlers.
  halt 
  ;; switch addressing mode
  ld a, %10000001
  ld [$FF40], a
  xor a
  ld [$FF0F], a
  ld a, %00000001
  ld [$FFFF], a ; vblank interupts
  halt
  ;; switch addressing mode
  ld a, %10010001
  ld [$FF40], a
  xor a
  ld [$FF0F], a
  ld a, %00000010
  ld [$FFFF], a
  jr .displayloop

  

SECTION "constants", ROM0
TileByteCount:
  DW 360 * 16

SECTION "data", ROM0
TileMap:
.start
  ;; Fill blank tile map data.
  ;; Only setting data for 20x18 tiles.
  DS 20 * 18, $00
.end

TileData:
.start
  ;; Fill blank tile data.
  ;; Filling enough space for 360 tiles, which is enough for 1 20x18 screen.
  ;ds 360 * 16, $FF
.end