"""
lambda call sagemaker diffusion model
"""

import sagemaker
from stability_sdk_sagemaker.predictor import StabilityPredictor
from stability_sdk.api import GenerationRequest, GenerationResponse, TextPrompt
from PIL import Image
import io
import base64
import boto3
import datetime
import json
import os 

STYLE = "anime"

s3_client = boto3.client("s3")

sagemaker_session = sagemaker.Session()

deployed_model = StabilityPredictor(
    endpoint_name=os.environ["ENDPOINT_NAME"], sagemaker_session=sagemaker_session
)


def decode_and_show(model_response: GenerationResponse) -> None:
    """
    Decodes and displays an image from SDXL output

    Args:
        model_response (GenerationResponse): The response object from the deployed SDXL model.

    Returns:
        None
    """
    # file name
    name = datetime.datetime.now().strftime("%m-%d-%Y-%H-%M-%S")
    # key
    key = f"diffuision/{name}.png"
    # image
    image = model_response.artifacts[0].base64
    image_data = base64.b64decode(image.encode())
    s3_client.upload_fileobj(io.BytesIO(image_data), os.environ["BUCKET_NAME"], key)
    # signed url
    sign_url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": os.environ["BUCKET_NAME"], "Key": key},
        ExpiresIn=3600,
    )
    # image = Image.open(io.BytesIO(image_data))
    # image.save("hehe.png")
    return sign_url


def handler(event, context):
    """
    handler
    """

    # parse prompt
    try:
        promt = event["queryStringParameters"]["prompt"]
    except:
        promt = "fish"

    # call model
    output = deployed_model.predict(
        GenerationRequest(
            text_prompts=[TextPrompt(text=promt)],
            style_preset=STYLE,
            seed=3,
            height=1024,
            width=1024,
        )
    )

    # save image to s3
    try: 
        url = decode_and_show(output)
    except:
        url = "ERROR"

    # return
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,GET",
        },
        "body": json.dumps(
            {
                "url": url,
            }
        ),
    }
