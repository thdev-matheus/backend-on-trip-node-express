import { DataSource } from "typeorm";
import AppDataSource from "../../../data-source";
import app from "../../../app";
import request from "supertest";
import {
  mockedAdmin,
  mockedAdminLogin,
  mockedUser,
  mockedUser3,
  mockedUser3Login,
  mockedUserLogin,
} from "../../mocks/userMocks";
import {
  mockedCategory,
  mockedCategory2,
  mockedType,
} from "../../mocks/otherMocks";
import { mockedCapacity } from "../../mocks/capacityMocks";
import { IAccommodationRequest } from "../../../interfaces/accommodations";
import {
  mockedAccommodation,
  mockedAccommodation2,
  mockedAccommodation3,
  mockedAccommodationInvalid,
  mockedAccommodationInvalidPatch,
  mockedAccommodationPatch,
  mockedAccommodationTooLarge,
  mockedAccommodationTooLargePatch,
} from "../../mocks/accommodationMocks";

describe("/accommodations", () => {
  let connection: DataSource;
  let genericUserToken: string;
  let genericUserToken2: string;
  let adminUserToken: any;
  let genericUserId: string;
  let genericUserId2: string;
  let adminUserId: string;
  let categoryId: string;
  let capacityId: string;
  let typeId: string;
  let genericAccommodation: IAccommodationRequest;
  let genericAccommodation2: IAccommodationRequest;

  beforeAll(async () => {
    await AppDataSource.initialize()
      .then((res) => {
        connection = res;
      })
      .catch((err) => {
        console.error("Error during Data Source initialization", err);
      });

    const createGenericUser = await request(app)
      .post("/users")
      .send(mockedUser);

    genericUserId = createGenericUser.body.data.id;

    const loginGenericUser = await request(app)
      .post("/login")
      .send(mockedUserLogin);

    genericUserToken = loginGenericUser.body.data.token;

    const createGenericUser2 = await request(app)
      .post("/users")
      .send(mockedUser3);

    genericUserId2 = createGenericUser2.body.data.id;

    const loginGenericUser2 = await request(app)
      .post("/login")
      .send(mockedUser3Login);

    genericUserToken2 = loginGenericUser2.body.data.token;

    const createAdminUser = await request(app).post("/users").send(mockedAdmin);

    adminUserId = createAdminUser.body.data.id;

    const loginAdminUser = await request(app)
      .post("/login")
      .send(mockedAdminLogin);

    adminUserToken = loginAdminUser.body.data.token;

    const createCategory = await request(app)
      .post("/categories")
      .send(mockedCategory2)
      .set("Authorization", `Bearer ${adminUserToken}`);

    categoryId = createCategory.body.data.id;

    const createCapacity = await request(app)
      .post("/capacities")
      .send(mockedCapacity)
      .set("Authorization", `Bearer ${adminUserToken}`);

    capacityId = createCapacity.body.data.id;

    const createType = await request(app)
      .post("/types")
      .send(mockedType)
      .set("Authorization", `Bearer ${adminUserToken}`);

    typeId = createType.body.data.id;

    genericAccommodation = {
      name: mockedAccommodation.name,
      description: mockedAccommodation.description,
      dailyPrice: mockedAccommodation.dailyPrice,
      userId: genericUserId,
      categoryId,
      capacityId,
      typeId,
    };

    genericAccommodation2 = {
      name: mockedAccommodation2.name,
      description: mockedAccommodation2.description,
      dailyPrice: mockedAccommodation2.dailyPrice,
      userId: genericUserId,
      categoryId,
      capacityId,
      typeId,
    };
  });

  afterAll(async () => {
    await connection.destroy();
  });

  test("POST /accommodations - Should be able to create an accommodation", async () => {
    const response = await request(app)
      .post("/accommodations")
      .send(genericAccommodation)
      .set("Authorization", `Bearer ${genericUserToken}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data).toHaveProperty(
      "name",
      genericAccommodation.name
    );
    expect(response.body.data).toHaveProperty(
      "description",
      genericAccommodation.description
    );
    expect(response.body.data).toHaveProperty(
      "dailyPrice",
      genericAccommodation.dailyPrice
    );
    expect(response.body.data).toHaveProperty("isActive", true);
    expect(response.body.data).toHaveProperty("verifiedByAdm", false);
    expect(response.body.data).toHaveProperty("specialOffer", false);
    expect(response.body.data).toHaveProperty("type");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("capacity");
    expect(response.body.data).toHaveProperty("category");
  });

  test("POST /accommodations - Should not be able to create an accommodation without authentication", async () => {
    const response = await request(app)
      .post("/accommodations")
      .send(genericAccommodation);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty(
      "message",
      "Missing authorization token"
    );
  });

  test("POST /accommodations - Should not be able to create an accommodation with invalid token", async () => {
    const response = await request(app)
      .post("/accommodations")
      .send(genericAccommodation)
      .set("Authorization", `Bearer ${genericUserToken}7627636745`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty("message", "Invalid token");
  });

  test("POST /accommodations - Should not be able to create an accommodation without all required fields", async () => {
    const invalidAccommodation = {
      name: mockedAccommodation.name,
      dailyPrice: mockedAccommodation.dailyPrice,
      userId: genericUserId,
      capacityId,
      typeId,
    };

    const response = await request(app)
      .post("/accommodations")
      .send(invalidAccommodation)
      .set("Authorization", `Bearer ${genericUserToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("status", "Error");
  });

  test("POST /accommodations - Should not be able to create an accommodation with a required field with invalid type", async () => {
    const invalidAccommodation = {
      name: mockedAccommodationInvalid.name,
      description: mockedAccommodationInvalid.description,
      dailyPrice: mockedAccommodationInvalid.dailyPrice,
      userId: genericUserId,
      categoryId,
      capacityId,
      typeId,
    };

    const response = await request(app)
      .post("/accommodations")
      .send(invalidAccommodation)
      .set("Authorization", `Bearer ${genericUserToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("status", "Error");
  });

  test("POST /accommodations - Should not be able to create an accommodation with a required field too large", async () => {
    const invalidAccommodation = {
      name: mockedAccommodationTooLarge.name,
      description: mockedAccommodationTooLarge.description,
      dailyPrice: mockedAccommodationTooLarge.dailyPrice,
      userId: genericUserId,
      categoryId,
      capacityId,
      typeId,
    };

    const response = await request(app)
      .post("/accommodations")
      .send(invalidAccommodation)
      .set("Authorization", `Bearer ${genericUserToken}`);

    expect(response.status).toBe(413);
    expect(response.body).toHaveProperty("status", "Error");
  });

  test("POST /accommodations - Should not be able to create an accommodation that already exists", async () => {
    const response = await request(app)
      .post("/accommodations")
      .send(genericAccommodation)
      .set("Authorization", `Bearer ${genericUserToken}`);

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("status", "Error");
  });

  test("GET /accommodations - Should be able to list all accommodations", async () => {
    await request(app)
      .post("/accommodations")
      .send(genericAccommodation2)
      .set("Authorization", `Bearer ${genericUserToken}`);

    const response = await request(app).get("/accommodations");

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("GET /accommodations/:id - Should be able to list an accommodation", async () => {
    const accommodations = await request(app).get("/accommodations");

    const accommodationId = accommodations.body[0].data.id;

    const response = await request(app)
      .get(`/accommodations/${accommodationId}`)
      .set("Authorization", `Bearer ${genericUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("id", accommodationId);
    expect(response.body.data).toHaveProperty("name");
    expect(response.body.data).toHaveProperty("description");
    expect(response.body.data).toHaveProperty("dailyPrice");
    expect(response.body.data).toHaveProperty("isActive");
    expect(response.body.data).toHaveProperty("verifiedByAdm");
    expect(response.body.data).toHaveProperty("specialOffer");
    expect(response.body.data).toHaveProperty("type");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("capacity");
    expect(response.body.data).toHaveProperty("category");
  });

  test("GET /accommodations/:id - Should not be able to list an accommodation without authentication", async () => {
    const accommodations = await request(app).get("/accommodations");

    const accommodationId = accommodations.body[0].data.id;

    const response = await request(app).get(
      `/accommodations/${accommodationId}`
    );

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty(
      "message",
      "Missing authorization token"
    );
  });

  test("GET /accommodations/:id - Should not be able to list an accommodation with invalid token", async () => {
    const accommodations = await request(app).get("/accommodations");

    const accommodationId = accommodations.body[0].data.id;

    const response = await request(app)
      .get(`/accommodations/${accommodationId}`)
      .set("Authorization", `Bearer ${genericUserToken}32733986`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty("message", "Invalid token");
  });

  test("GET /accommodations/:id - Should not be able to list an accommodation that does not exist", async () => {
    const accommodations = await request(app).get("/accommodations");

    const accommodationId = accommodations.body[0].data.id;

    const response = await request(app)
      .get(`/accommodations/${accommodationId}2367235`)
      .set("Authorization", `Bearer ${genericUserToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty("message", "Accommodation not found");
  });

  test("PATCH /accommodations/:id - Should be able to update an accommodation", async () => {
    const accommodations = await request(app).get("/accommodations");

    const accommodationId = accommodations.body[0].data.id;

    const response = await request(app)
      .patch(`/accommodations/${accommodationId}`)
      .send(mockedAccommodationPatch)
      .set("Authorization", `Bearer ${genericUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("id", accommodationId);
    expect(response.body.data).toHaveProperty("name");
    expect(response.body.data).toHaveProperty("description");
    expect(response.body.data).toHaveProperty("dailyPrice");
    expect(response.body.data).toHaveProperty("isActive");
    expect(response.body.data).toHaveProperty("verifiedByAdm");
    expect(response.body.data).toHaveProperty("specialOffer");
    expect(response.body.data).toHaveProperty("type");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("capacity");
    expect(response.body.data).toHaveProperty("category");
  });

  test("PATCH /accommodations/:id - Should not be able to update an accommodation without authentication", async () => {
    const accommodations = await request(app).get("/accommodations");

    const accommodationId = accommodations.body[0].data.id;

    const response = await request(app)
      .patch(`/accommodations/${accommodationId}`)
      .send(mockedAccommodationPatch);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty(
      "message",
      "Missing authorization token"
    );
  });

  test("PATCH /accommodations/:id - Should not be able to update an accommodation with invalid token", async () => {
    const accommodations = await request(app).get("/accommodations");

    const accommodationId = accommodations.body[0].data.id;

    const response = await request(app)
      .patch(`/accommodations/${accommodationId}`)
      .send(mockedAccommodationPatch)
      .set("Authorization", `Bearer ${genericUserToken}48762348`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty("message", "Invalid token");
  });

  test("PATCH /accommodations/:id - Should not be able to update an accommodation if the user is not the owner and is not an admin", async () => {
    const accommodations = await request(app).get("/accommodations");

    const accommodationId = accommodations.body[0].data.id;

    const response = await request(app)
      .patch(`/accommodations/${accommodationId}`)
      .send(mockedAccommodationPatch)
      .set("Authorization", `Bearer ${genericUserToken2}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty(
      "message",
      "Not possible to non-admin users to update an accommodation without being the owner"
    );
  });

  test("PATCH /accommodations/:id - Should not be able to update an accommodation with a field with invalid type", async () => {
    const accommodations = await request(app).get("/accommodations");

    const accommodationId = accommodations.body[0].data.id;

    const response = await request(app)
      .patch(`/accommodations/${accommodationId}`)
      .send(mockedAccommodationInvalidPatch)
      .set("Authorization", `Bearer ${genericUserToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty("message");
  });

  test("PATCH /accommodations/:id - Should not be able to update an accommodation with a field with length too large", async () => {
    const accommodations = await request(app).get("/accommodations");

    const accommodationId = accommodations.body[0].data.id;

    const response = await request(app)
      .patch(`/accommodations/${accommodationId}`)
      .send(mockedAccommodationTooLargePatch)
      .set("Authorization", `Bearer ${genericUserToken}`);

    expect(response.status).toBe(413);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty("message");
  });

  test("PATCH /accommodations/:id - Should not be able to update an accommodation without having any changes in any field", async () => {
    const createAccommodResponse = await request(app)
      .post("/accommodations")
      .send(mockedAccommodation3)
      .set("Authorization", `Bearer ${genericUserToken}`);

    const accommodationId = createAccommodResponse.body.data.id;

    const response = await request(app)
      .patch(`/accommodations/${accommodationId}`)
      .send(createAccommodResponse.body.data)
      .set("Authorization", `Bearer ${genericUserToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty(
      "message",
      "Not possible to update an accommodation without having any changes in any field"
    );
  });

  test("PATCH /accommodations/:id - Should not be able to update an accommodation that does exist", async () => {
    const response = await request(app)
      .patch("/accommodations/2738ajyh6863f565865sfg")
      .send(mockedAccommodationPatch)
      .set("Authorization", `Bearer ${genericUserToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty("message", "Accommodation not found");
  });

  test("DELETE /accommodations/:id - Should be able to delete an accommodation", async () => {
    const accommodations = await request(app).get("/accommodations");

    const accommodationId = accommodations.body[0].data.id;

    const response = await request(app)
      .delete(`/accommodations/${accommodationId}`)
      .set("Authorization", `Bearer ${genericUserToken}`);

    expect(response.status).toBe(204);
    expect(response.body).toHaveProperty(
      "message",
      "Accommodation deleted with success"
    );
  });

  test("DELETE /accommodations/:id - Should not be able to delete an accommodation without authentication", async () => {
    const accommodations = await request(app).get("/accommodations");

    const accommodationId = accommodations.body[0].data.id;

    const response = await request(app).delete(
      `/accommodations/${accommodationId}`
    );

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty(
      "message",
      "Missing authorization token"
    );
  });

  test("DELETE /accommodations/:id - Should not be able to delete an accommodation with invalid token", async () => {
    const accommodations = await request(app).get("/accommodations");

    const accommodationId = accommodations.body[0].data.id;

    const response = await request(app)
      .delete(`/accommodations/${accommodationId}`)
      .set("Authorization", `Bearer ${genericUserToken}8783sgyd6725ad`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty("message", "Invalid token");
  });

  test("DELETE /accommodations/:id - Should not be able to delete an accommodation if the user is not the owner and is not an admin", async () => {
    const accommodations = await request(app).get("/accommodations");

    const accommodationId = accommodations.body[0].data.id;

    const response = await request(app)
      .delete(`/accommodations/${accommodationId}`)
      .set("Authorization", `Bearer ${genericUserToken2}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty(
      "message",
      "Not possible to non-admin users to delete an accommodation without being the owner"
    );
  });

  test("DELETE /accommodations/:id - Should not be able to delete an accommodation that is already deleted", async () => {
    const accommodations = await request(app).get("/accommodations");

    const accommodationId = accommodations.body[0].data.id;

    const response = await request(app)
      .delete(`/accommodations/${accommodationId}`)
      .set("Authorization", `Bearer ${genericUserToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty(
      "message",
      "Accommodation already deleted"
    );
  });

  test("DELETE /accommodations/:id - Should not be able to delete an accommodation that does not exist", async () => {
    const response = await request(app)
      .delete("/accommodations/7632hg76v73ft67f3r9985rsd")
      .set("Authorization", `Bearer ${genericUserToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("status", "Error");
    expect(response.body).toHaveProperty("message", "Accommodation not found");
  });
});