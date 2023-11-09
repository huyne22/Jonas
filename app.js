const fs = require('fs');
const express = require('express');
const app = express();
const port = 3004;
app.use(express.json());
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    result : tours.length,
    data: {
      tours
    },
  });
}
const getTour =  (req, res) => {
  console.log(req.params)
  const id = req.params.id * 1;
  const tour = tours.find(el => el.id === id)
  if(!tour){
    res.status(200).json({
      status: 'fail',
      message : 'err'
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
}
const updateTour = (req,res) => {
  const id = req.params.id * 1;
  if(id > tours.length){
   return res.status(404).json({
      status: 'fail',
      message : 'Tour not found'
    });
  }
  res.status(200).json({
    status : 'success',
    data: {
      tour : '<Update data ...>'
    }
  })
}
const createTour = (req, res) => {
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
const deleteTour =  (req,res) => {
  const id = req.params.id * 1;
  if(id > tours.length){
   return res.status(404).json({
      status: 'fail',
      message : 'Tour not found'
    });
  }
  res.status(204).json({
    status : 'success',
    data: null
  })
}
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour)
// app.delete('/api/v1/tours/:id',deleteTour)

app.route('/api/v1/tours')
    .get(getAllTours)
    .post(createTour)
app.route('/api/v1/tours/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour)
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
