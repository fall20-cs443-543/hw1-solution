/*
  Basic File I/O for displaying
  Skeleton Author: Joshua A. Levine
  Email: josh@email.arizona.edu
  Modified by: Xueheng Wan
  Email: wanxueheng@email.arizona.edu
  */


//access DOM elements we'll use
var input = document.getElementById("load_image");
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var ppm_image_data;
let degree = 0;

//Function to process upload
var upload = function () {
    if (input.files.length > 0) {
        var file = input.files[0];
        console.log("You chose", file.name);
        if (file.type) console.log("It has type", file.type);
        var fReader = new FileReader();
        fReader.readAsBinaryString(file);

        fReader.onload = function(e) {
            //if successful, file data has the contents of the uploaded file
            var file_data = fReader.result;
            parsePPM(file_data);
        }

        window.setInterval(rotate, 50);
    }
}

function parsePPM(file_data){
    /*
   * Extract header
   */
    var format = "";
    var width = 0;
    var height = 0;
    var max_v = 0;
    var lines = file_data.split(/#[^\n]*\s*|\s+/); // split text by whitespace or text following '#' ending with whitespace
    var counter = 0;
    // get attributes
    for(var i = 0; i < lines.length; i ++){
        if(lines[i].length == 0) {continue;} //in case, it gets nothing, just skip it
        if(counter == 0){
            format = lines[i];
        }else if(counter == 1){
            width = lines[i];
        }else if(counter == 2){
            height = lines[i];
        }else if(counter == 3){
            max_v = Number(lines[i]);
        }else if(counter > 3){
            break;
        }
        counter ++;
    }
    console.log("Format: " + format);
    console.log("Width: " + width);
    console.log("Height: " + height);
    console.log("Max Value: " + max_v);
    /*
     * Extract Pixel Data
     */
    var bytes = new Uint8Array(3 * width * height);  // i-th R pixel is at 3 * i; i-th G is at 3 * i + 1; etc.
                                                            // i-th pixel is on Row i / width and on Column i % width
    // Raw data must be last 3 X W X H bytes of the image file
    var raw_data = file_data.substring(file_data.length - width * height * 3);
    for(var i = 0; i < width * height * 3; i ++){
        // convert raw data byte-by-byte
        bytes[i] = raw_data.charCodeAt(i);
    }
    // update width and height of canvas
    document.getElementById("canvas").setAttribute("width", window.innerWidth);
    document.getElementById("canvas").setAttribute("height", window.innerHeight);
    // create ImageData object
    var image_data = ctx.createImageData(width, height);
    // fill ImageData
    for(var i = 0; i < image_data.data.length; i+= 4){
        let pixel_pos = parseInt(i / 4);
        image_data.data[i + 0] = bytes[pixel_pos * 3 + 0]; // Red ~ i + 0
        image_data.data[i + 1] = bytes[pixel_pos * 3 + 1]; // Green ~ i + 1
        image_data.data[i + 2] = bytes[pixel_pos * 3 + 2]; // Blue ~ i + 2
        image_data.data[i + 3] = 255; // A channel is deafult to 255
    }
    ctx.putImageData(image_data, canvas.width/2 - width/2, canvas.height/2 - height/2);
    ppm_image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function rotate(){
    console.log("rotate ... ");
    // update width and height of canvas
    var image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    /*
     * TODO: ADD CODE HERE TO DO 2D TRANSFORMATION
     * Change anything if needed
     */
    // Increment rotation degree
    degree += 5;
    if(degree === 360) {
        degree = 0;
    }
    // create ImageData object
    var new_image_data = ctx.createImageData(image_data);
    for(var i = 0; i < image_data.data.length; i+= 4){
        let pixel_pos = parseInt(i / 4);
        let x = pixel_pos % canvas.width;
        let y = parseInt(pixel_pos / canvas.width);

        let xy_rotated = rotatePoint(canvas.width / 2, canvas.height / 2, x, y, degree);
        let arr_pos = (Math.floor(xy_rotated[0]) + Math.floor(xy_rotated[1]) * canvas.width) * 4;
        new_image_data.data[arr_pos + 0] = ppm_image_data.data[i + 0];
        new_image_data.data[arr_pos + 1] = ppm_image_data.data[i + 1];
        new_image_data.data[arr_pos + 2] = ppm_image_data.data[i + 2];
        new_image_data.data[arr_pos + 3] = ppm_image_data.data[i + 3];
    }
    ctx.putImageData(new_image_data, 0, 0);
}

function rotatePoint(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        // Translate image coordinate to cartesian coordinate
        nx = x - cx;
        ny = y - cy;
        // apply formula
        nx = (cos * (nx)) + (sin * (ny)) + cx;
        ny = (cos * (ny)) - (sin * (nx)) + cy;
        // Translate cartesian coordinate to image coordinate
        nx += cx
        ny += cy
    return [nx, ny];
}

//Connect event listeners
input.addEventListener("change", upload);