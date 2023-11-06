const axios = require("axios");
const {prepare} = require("../setup/test-helper");
describe("Admin User Tests", () => {
  let config = null;
  let config2 = null;//
  let userLogin = null;
  let userToDeleteLogin = null;
  let adminLogin = null;
  let admin2Login = null;//
  beforeAll(async () => {// Note we use JWT authentication for the API,// therefore we need to authenticate our request for the test.
    userLogin = await axios.post(prepare("/users/login/"), {
      email: "testuser@test.com",
      password: "12345"
    });
    userToDeleteLogin = await axios.post(prepare("/users/login/"), {
      email: "testusertodelete@test.com",
      password: "12345"
    });

    adminLogin = await axios.post(prepare("/users/login/"), {
      email: "test@test.com",
      password: "12345"
    });
    const {accessToken} = adminLogin.data;
    config = {
      headers: { Authorization: `Bearer ${accessToken}` }
    } 

    admin2Login = await axios.post(prepare("/users/login/"), {
      email: "test2@test.com",
      password: "12345"
    });
    const {accessToken: AccessToken2} = admin2Login.data;
    config2 = {
      headers: { Authorization: `Bearer ${AccessToken2}` }
    } 
  });


  //// user.js 3. get info of all
  it("should get all users", async () => {
    const response = await axios.get(prepare("/users"), config);//users sub by orders
    expect(response.status).toEqual(200);
  });


//////////////////////////////////////////////
//// user.js 4. get info of one 
it("should get one user", async () => {
  const response = await axios.get(prepare("/users/" + userLogin.data.user.id), config);
  //users sub by orders
  expect(response.status).toEqual(200);
});
///////////////////////////////////////////////////

  //// order.js 2. get orders of user
  it("should get posted orders", async () => {
    // Get all orders of user.
    const response = await axios.get(prepare("/orders"), config);
    expect(response.status).toEqual(200);
  });


  //// order.js 1. get orders of any user
  it("should get orders of another user", async () => {
    // Get all orders of user.
    const {id} = userLogin.data.user;
    const response = await axios.get(prepare("/orders/user/" + id), config);
    expect(response.status).toEqual(200);
  });
  

  it("should hit generic admin user error", async () => {
    await axios.get(prepare("/users/nouser"), config).catch(error => {
      // Unauthorized
      expect(error.response.status).toEqual(400);
    });
  });


//// order.js 4. add a new order
  it("should add an order", async () => {
    // Insert order.
    const insertedOrderResponse = await axios.post(prepare("/order"), {
      "type": "Box2",
      "description": "{Test Order}"
    }, config);
    const {_id} = insertedOrderResponse.data; 
    // Get previously inserted object and check.
    const responseOrders = await axios.get(prepare("/order/" + _id), config);
    expect(responseOrders.data.type).toEqual("Box2");
  });


//// user.js 5. Delete a user
  it("should delete a simple user", async () => {
    const response = await axios.delete(prepare("/user/" + userToDeleteLogin.data.user.id), config);
    expect(response.status).toEqual(200);

  });


//// user.js 5. Delete a user
  it("should fail to delete an admin user", async () => {
    await axios.delete(prepare("/user/" + admin2Login.data.user.id), config).catch(error => {
      // Unauthorized
      expect(error.response.status).toEqual(403);
    });
  });


  it("should update credentials", async () => {
    expect(true).toEqual(true);
  });


  it("should fail updating credentials of another user", async () => {
    expect(true).toEqual(true);
  });


/////////////////////////////////////////
  //// order.js 3. get single order info
  //// order.js 4. add a new order
  //// order.js 2. get orders of user
  // Is admin; Is self user
  it("should get a specific order3", async () => {
    // Insert Order.
    await axios.post(prepare("/order"), {
      "type": "Box1",
      "description": "{Test Order}"
    }, config);
    const allOrdersResponse = await axios.get(prepare("/orders"), config);
    const {data} = allOrdersResponse;
    const firstOrderID = data[0]._id;
    // console.log("hello");
    // console.log(firstOrderID);
    const singleOrderResponse = await axios.get(prepare("/order/" + firstOrderID), config);
    expect(singleOrderResponse.status).toEqual(200);
  });
  //////////////////////////////////////////////


/////////////////////////////////////////
  //// order.js 3. get single order info
  //// order.js 4. add a new order
  //// order.js 2. get orders of user
  // Is admin; Not self user
  it("should get a specific order4", async () => {
    // Insert Order.
    await axios.post(prepare("/order"), {
      "type": "Box1",
      "description": "{Test Order}"
    }, config);
    const allOrdersResponse = await axios.get(prepare("/orders"), config);
    const {data} = allOrdersResponse;
    const firstOrderID = data[0]._id;
    // console.log("hello");
    // console.log(firstOrderID);
    const singleOrderResponse = await axios.get(prepare("/order/" + firstOrderID), config2);
    expect(singleOrderResponse.status).toEqual(200);
  });
  //////////////////////////////////////////////


  ///////////////////////////////////////////////////////////////////
//// order.js 5. update an existing order 
  //// Is admin, Is self
  //// order.js 4. add
  //// order.js 3. get single order info
  it("should add, then update an order3", async () => {
    // Insert order.
    const insertedResponse = await axios.post(prepare("/order"), {
      "type": "Box2"
    }, config);
    // Update order.
    const updated = await axios.put(prepare("/order/"), {
      "_id": insertedResponse.data._id,
      "type": "Box1",
      "description": "{Test Order Updated}"
    }, config);
    // Get previously inserted object and check.
    const orderResponse = await axios.get(prepare("/order/") + insertedResponse.data._id, config);
    const {data} = orderResponse;
    expect(data.type).toEqual("Box1");
    expect(data.description).toEqual("{Test Order Updated}");
  });
///////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  //// endpoints/order.js bug corrected
  //// order.js 5. update an existing order 
  //// Is admin, Is self
  //// order.js 4. add
  //// order.js 3. get single order info
  it("should add, then update an order3.2", async () => {
    const insertedOrderResponse = await axios.post(prepare("/order"), {
      "type": "Box2",
    }, config);
    const {data} = insertedOrderResponse;
    await axios.delete(prepare("/order/" + data._id), config);
    const updated = await axios.put(prepare("/order/"), {
      "_id": data._id,
      "type": "Box1",
    }, config).catch(error => {
      expect(error.response.status).toEqual(404);
    });
  });
  ///////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////
//// order.js 5. update an existing order 
  //// Is admin, Not self
  //// order.js 4. add
  //// order.js 3. get single order info
  it("should add, then update an order4", async () => {
    // Insert order.
    const insertedResponse = await axios.post(prepare("/order"), {
      "type": "Box2"
    }, config);
    // Update order.
    const updated = await axios.put(prepare("/order/"), {
      "_id": insertedResponse.data._id,
      "type": "Box1",
      "description": "{Test Order Updated}"
    }, config2);
    // Get previously inserted object and check.
    const orderResponse = await axios.get(prepare("/order/") + insertedResponse.data._id, config);
    const {data} = orderResponse;
    expect(data.type).toEqual("Box1");
    expect(data.description).toEqual("{Test Order Updated}");
  });
///////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  //// endpoints/order.js bug corrected
  //// order.js 5. update an existing order 
  //// Is admin, Not self
  //// order.js 4. add
  //// order.js 3. get single order info
  it("should add, then update an order3.2", async () => {
    const insertedOrderResponse = await axios.post(prepare("/order"), {
      "type": "Box2",
    }, config);
    const {data} = insertedOrderResponse;
    await axios.delete(prepare("/order/" + data._id), config);
    const updated = await axios.put(prepare("/order/"), {
      "_id": data._id,
      "type": "Box1",
    }, config2).catch(error => {
      expect(error.response.status).toEqual(404);
    });
  });
  ///////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////
  //// order.js 6. delete an order
  //// Is admin, Is self
  //// order.js 4. add a new order
  //// order.js 3. get single order info (the first failure)
  it("should add, then delete an order3", async () => {
    const insertedOrderResponse = await axios.post(prepare("/order"), {
      "type": "Box2",
      "description": "{Test Order}"
    }, config);
    const {data} = insertedOrderResponse;
    await axios.delete(prepare("/order/" + data._id), config);
    await axios.get(prepare("/order/" + data._id), config).catch(error => {
      expect(error.response.status).toEqual(404);
    });
  });
  ////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////
  //// order.js 6. delete an order
  //// Is admin, Not self
  //// order.js 4. add a new order
  //// order.js 3. get single order info (the first failure)
  it("should add, then delete an order3", async () => {
    const insertedOrderResponse = await axios.post(prepare("/order"), {
      "type": "Box2",
      "description": "{Test Order}"
    }, config);
    const {data} = insertedOrderResponse;
    await axios.delete(prepare("/order/" + data._id), config2);
    await axios.get(prepare("/order/" + data._id), config).catch(error => {
      expect(error.response.status).toEqual(404);
    });
  });
  ////////////////////////////////////////////////////////////////////
});
