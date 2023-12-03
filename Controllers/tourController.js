const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
  );
  exports.checkID = (req, res,next,val) => {
    console.log(`Tour id is: ${val}`)
    const id = req.params.id * 1;
    if(id > tours.length){
     return res.status(404).json({
        status: 'fail',
        message : 'Tour not found'
      });
    }
    next();
  }

  exports.checkBody = (req, res,next) => {
    console.log("đa",req.body)
    if(!req.body.name || !req.body.price){
        return res.status(400).json({
            status: 'fail',
            message: 'This data not yet have!'
        })
    }
    next()
}

exports.getAllTours = (req, res) => {
    res.status(200).json({
      status: 'success',
      requestAt : req.requestTime,
      result : tours.length,
      data: {
        tours
      },
    });
  }
  exports.getTour =  (req, res) => {
    console.log(req.params)
    const id = req.params.id * 1;
    const tour = tours.find(el => el.id === id)
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  }
  exports.updateTour = (req,res) => {
    res.status(200).json({
      status : 'success',
      data: {
        tour : '<Update data ...>'
      }
    })
  }
  exports.createTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
    console.log(newId)
    const newTour = Object.assign({ id: newId }, req.body);
    tours.push(newTour);
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      (err) => {
        res.status(200).json({
          status: 'success',
          data: {
            tours: newTour,
          },
        });
      }
    );
  }
  exports.deleteTour =  (req,res) => {
    res.status(204).json({
      status : 'success',
      data: null
    })
  }